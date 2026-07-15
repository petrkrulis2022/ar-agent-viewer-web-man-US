// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title P2PEscrow
 * @notice Per-trade, non-custodial escrow for the P2P Cube **crypto-for-cash** flow
 *         (Use Case A). The seller deposits crypto; the buyer pays fiat off-chain
 *         (e.g. Revolut); the seller manually confirms receipt and releases.
 *
 * @dev DESIGN NOTES — read before auditing or extending:
 *
 *  - This contract is for the FIAT mode only. The trustless crypto-for-crypto mode
 *    (Use Case B) is a *different* contract — see AtomicSwapEscrow.sol — and should be
 *    built FIRST (see p2p.md §17, reordered phases). This escrow has unavoidable trust
 *    and dispute surface because the fiat leg cannot be verified on-chain.
 *
 *  - Release is MANUAL by the seller and never automatic. There is intentionally NO
 *    auto-release on a payment webhook: bank transfers can be delayed or reversed, so a
 *    webhook-triggered release is a theft vector (p2p.md §4, Decision 1). The buyer's
 *    "I've paid" signal is ADVISORY only — it emits an event and timestamps, nothing more.
 *
 *  - `arbiter` is the single centralization point (V1 manual dispute resolution). It can
 *    only act AFTER a dispute is raised, and only chooses between the two legitimate
 *    outcomes (pay buyer / refund seller). It can never take funds for itself. This role
 *    is the part of the system that most resembles "operating an exchange" — see the
 *    regulatory/privacy tension flagged in p2p.md §11.3. V2 replaces it with staked
 *    decentralized arbitration.
 *
 *  - Funds are released to `buyer` (a plain EVM address — in practice an ephemeral
 *    one-time wallet). Releasing into a Railgun shielded address is NOT done here; that
 *    is a higher-layer flow (the buyer shields after receiving, or the release target is
 *    a Railgun relay set as `buyer`). `buyerRailgunAddress` below is stored only as
 *    opt-in metadata for that off-contract flow and is never used for transfers.
 *
 *  - Supports native ETH (`asset == address(0)`) or any ERC-20.
 *
 *  - Deployed once per trade by P2PEscrowFactory. Constructor params are immutable for
 *    the lifetime of the trade.
 *
 *  - ⚠️ Toolchain is greenfield: there is no Hardhat/Foundry in this repo yet and
 *    @openzeppelin/contracts is not installed. This file will not compile until the
 *    contract workspace is scaffolded. It is a reviewed draft of the settlement logic.
 */
contract P2PEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ---------------------------------------------------------------------
    // Types
    // ---------------------------------------------------------------------

    enum Status {
        Created, // deployed, not yet funded
        Funded, // seller deposited; agent becomes active
        Released, // seller released to buyer (terminal)
        Refunded, // returned to seller after expiry/cancel (terminal)
        Disputed // buyer raised a dispute; awaiting arbiter (auto-refund suspended)
    }

    // ---------------------------------------------------------------------
    // Immutable trade parameters
    // ---------------------------------------------------------------------

    address public immutable factory;
    address public immutable seller; // Bob's ephemeral address (the only depositor)
    address public immutable buyer; // Alice's ephemeral / one-time receiving address
    address public immutable arbiter; // platform key, V1 manual dispute resolution only
    address public immutable asset; // address(0) for native ETH, else ERC-20
    uint256 public immutable amount; // exact amount held in escrow
    uint256 public immutable expiresAt; // after this, seller may reclaim if not released
    bytes32 public immutable orderHash; // trade identifier / AR agent filter key

    /// @notice Opt-in metadata for an off-contract Railgun receive flow. NEVER used for
    ///         on-chain transfers in this contract. May be empty.
    bytes public buyerRailgunAddress;

    // ---------------------------------------------------------------------
    // Mutable state
    // ---------------------------------------------------------------------

    Status public status;
    uint256 public paymentSignaledAt; // when buyer signaled fiat payment (advisory, 0 = never)

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    event Deposited(address indexed asset, uint256 amount);
    event PaymentSignaled(address indexed buyer, uint256 timestamp); // advisory only
    event Released(address indexed to, uint256 amount);
    event Refunded(address indexed to, uint256 amount);
    event DisputeRaised(address indexed by, uint256 timestamp);
    event DisputeResolved(address indexed arbiter, bool releasedToBuyer);

    // ---------------------------------------------------------------------
    // Errors
    // ---------------------------------------------------------------------

    error OnlySeller();
    error OnlyBuyer();
    error OnlyArbiter();
    error BadStatus(Status expected, Status actual);
    error WrongValue();
    error NotExpired();
    error ZeroAmount();

    // ---------------------------------------------------------------------
    // Modifiers
    // ---------------------------------------------------------------------

    modifier onlySeller() {
        if (msg.sender != seller) revert OnlySeller();
        _;
    }

    modifier onlyBuyer() {
        if (msg.sender != buyer) revert OnlyBuyer();
        _;
    }

    modifier onlyArbiter() {
        if (msg.sender != arbiter) revert OnlyArbiter();
        _;
    }

    modifier inStatus(Status expected) {
        if (status != expected) revert BadStatus(expected, status);
        _;
    }

    // ---------------------------------------------------------------------
    // Construction
    // ---------------------------------------------------------------------

    constructor(
        address _seller,
        address _buyer,
        address _arbiter,
        address _asset,
        uint256 _amount,
        uint256 _duration, // seconds from deploy until auto-refund eligibility
        bytes32 _orderHash,
        bytes memory _buyerRailgunAddress
    ) {
        if (_amount == 0) revert ZeroAmount();
        require(_seller != address(0) && _buyer != address(0), "zero party");
        require(_seller != _buyer, "seller==buyer");

        factory = msg.sender;
        seller = _seller;
        buyer = _buyer;
        arbiter = _arbiter; // may be address(0) to disable disputes entirely
        asset = _asset;
        amount = _amount;
        expiresAt = block.timestamp + _duration;
        orderHash = _orderHash;
        buyerRailgunAddress = _buyerRailgunAddress;
        status = Status.Created;
    }

    // ---------------------------------------------------------------------
    // 1. Seller funds the escrow
    // ---------------------------------------------------------------------

    /**
     * @notice Seller deposits `amount` of `asset` into escrow. For native ETH send
     *         exactly `amount` as msg.value; for ERC-20 send 0 value (token is pulled
     *         via transferFrom — seller must have approved this contract first).
     */
    function deposit() external payable onlySeller inStatus(Status.Created) nonReentrant {
        if (asset == address(0)) {
            if (msg.value != amount) revert WrongValue();
        } else {
            if (msg.value != 0) revert WrongValue();
            // Pull tokens; SafeERC20 reverts on failure. Note: fee-on-transfer tokens
            // are NOT supported — the contract assumes exactly `amount` arrives.
            IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        }
        status = Status.Funded;
        emit Deposited(asset, amount);
    }

    // ---------------------------------------------------------------------
    // 2. Buyer signals fiat payment (ADVISORY ONLY — does not move funds)
    // ---------------------------------------------------------------------

    /**
     * @notice Buyer records that they have sent the off-chain (e.g. Revolut) payment.
     *         This is purely a notification hook for the seller's UI. It does NOT
     *         release funds and is NOT trusted by the contract for anything except
     *         suspending the auto-refund window once a dispute is raised.
     */
    function signalPayment() external onlyBuyer inStatus(Status.Funded) {
        paymentSignaledAt = block.timestamp;
        emit PaymentSignaled(buyer, block.timestamp);
    }

    // ---------------------------------------------------------------------
    // 3a. Normal path: seller confirms fiat received → releases to buyer
    // ---------------------------------------------------------------------

    /**
     * @notice Seller releases the escrowed asset to the buyer after manually verifying
     *         the fiat payment cleared. Only the seller can call this. Irreversible.
     */
    function release() external onlySeller inStatus(Status.Funded) nonReentrant {
        status = Status.Released;
        _payout(buyer);
        emit Released(buyer, amount);
    }

    // ---------------------------------------------------------------------
    // 3b. Failure path: buyer never paid → seller reclaims after expiry
    // ---------------------------------------------------------------------

    /**
     * @notice After `expiresAt`, if the trade was funded but not released and is not in
     *         dispute, the seller reclaims the escrow. Callable only by the seller.
     */
    function claimRefund() external onlySeller inStatus(Status.Funded) nonReentrant {
        if (block.timestamp < expiresAt) revert NotExpired();
        status = Status.Refunded;
        _payout(seller);
        emit Refunded(seller, amount);
    }

    // ---------------------------------------------------------------------
    // 4. Dispute (V1: arbiter-resolved). Suspends auto-refund.
    // ---------------------------------------------------------------------

    /**
     * @notice Buyer raises a dispute (e.g. "I paid but seller won't release"). This
     *         moves the trade out of Funded so claimRefund can no longer fire, freezing
     *         the funds until the arbiter resolves. Requires the buyer to have signaled
     *         payment first (prevents griefing by a non-paying buyer).
     */
    function raiseDispute() external onlyBuyer inStatus(Status.Funded) {
        require(paymentSignaledAt != 0, "signal payment first");
        require(arbiter != address(0), "disputes disabled");
        status = Status.Disputed;
        emit DisputeRaised(msg.sender, block.timestamp);
    }

    /**
     * @notice Arbiter resolves a dispute by choosing the only two legitimate outcomes:
     *         pay the buyer (fiat was received) or refund the seller (it wasn't). The
     *         arbiter can never redirect funds to itself.
     * @param releaseToBuyer true → buyer receives the asset; false → seller is refunded.
     */
    function resolveDispute(bool releaseToBuyer)
        external
        onlyArbiter
        inStatus(Status.Disputed)
        nonReentrant
    {
        if (releaseToBuyer) {
            status = Status.Released;
            _payout(buyer);
            emit Released(buyer, amount);
        } else {
            status = Status.Refunded;
            _payout(seller);
            emit Refunded(seller, amount);
        }
        emit DisputeResolved(msg.sender, releaseToBuyer);
    }

    // ---------------------------------------------------------------------
    // Internal payout (checks-effects-interactions: status already set by caller)
    // ---------------------------------------------------------------------

    function _payout(address to) private {
        if (asset == address(0)) {
            (bool ok, ) = payable(to).call{value: amount}("");
            require(ok, "ETH transfer failed");
        } else {
            IERC20(asset).safeTransfer(to, amount);
        }
    }

    // ---------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------

    /// @notice True once the escrow has reached a terminal state.
    function isSettled() external view returns (bool) {
        return status == Status.Released || status == Status.Refunded;
    }

    /// @notice Reject stray ETH; deposits must go through deposit().
    receive() external payable {
        revert("use deposit()");
    }
}
