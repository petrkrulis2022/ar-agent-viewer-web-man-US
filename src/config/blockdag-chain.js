// BlockDAG Primordial Testnet Configuration for ThirdWeb
export const BlockDAGTestnet = {
  chainId: 1043,
  name: 'BlockDAG Primordial Testnet',
  chain: 'BlockDAG',
  nativeCurrency: {
    name: 'BDAG',
    symbol: 'BDAG',
    decimals: 18,
  },
  rpc: ['https://rpc-testnet.blockdag.org'],
  faucets: [],
  explorers: [
    {
      name: 'BlockDAG Explorer',
      url: 'https://explorer-testnet.blockdag.org',
      standard: 'EIP3091',
    },
  ],
  infoURL: 'https://blockdag.network',
  shortName: 'bdag-testnet',
  networkId: 1043,
  icon: {
    url: 'https://via.placeholder.com/64x64/8b5cf6/ffffff?text=BD',
    width: 64,
    height: 64,
    format: 'png',
  },
  testnet: true,
  slug: 'blockdag-testnet',
};

// USDFC Token Configuration
export const USDFCToken = {
  address: '0x...', // Replace with actual USDFC token contract address
  name: 'USD Filecoin',
  symbol: 'USDFC',
  decimals: 18,
  chainId: 1043,
  logoURI: 'https://via.placeholder.com/64x64/059669/ffffff?text=USDFC',
};

// Contract addresses for the NeAR Viewer ecosystem
export const ContractAddresses = {
  // Agent interaction contracts
  AgentRegistry: '0x...', // Replace with actual contract address
  PaymentProcessor: '0x...', // Replace with actual contract address
  
  // Token contracts
  USDFC: USDFCToken.address,
  
  // NFT contracts for agent ownership
  AgentNFT: '0x...', // Replace with actual contract address
  
  // Governance contracts
  NeARDAO: '0x...', // Replace with actual contract address
};

// Network configuration helper
export const getNetworkConfig = () => {
  return {
    chain: BlockDAGTestnet,
    tokens: {
      USDFC: USDFCToken,
    },
    contracts: ContractAddresses,
    features: {
      gasless: true,
      socialLogin: true,
      nftSupport: true,
      daoGovernance: true,
    },
  };
};

// Chain switching helper
export const switchToBlockDAG = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Try to switch to BlockDAG network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BlockDAGTestnet.chainId.toString(16)}` }],
      });
      
      console.log('✅ Switched to BlockDAG Testnet');
      return true;
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${BlockDAGTestnet.chainId.toString(16)}`,
                chainName: BlockDAGTestnet.name,
                nativeCurrency: BlockDAGTestnet.nativeCurrency,
                rpcUrls: BlockDAGTestnet.rpc,
                blockExplorerUrls: BlockDAGTestnet.explorers.map(e => e.url),
              },
            ],
          });
          
          console.log('✅ Added and switched to BlockDAG Testnet');
          return true;
        } catch (addError) {
          console.error('❌ Failed to add BlockDAG network:', addError);
          return false;
        }
      } else {
        console.error('❌ Failed to switch to BlockDAG network:', switchError);
        return false;
      }
    }
  } else {
    console.error('❌ MetaMask not detected');
    return false;
  }
};

export default BlockDAGTestnet;

