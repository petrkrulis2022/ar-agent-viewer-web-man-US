import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  Zap,
  Settings,
  Info,
  ExternalLink,
  Network,
} from "lucide-react";
import ThirdWebWalletConnect from "./ThirdWebWalletConnect";
import SolanaWalletConnect from "./SolanaWalletConnect";
import MorphWalletConnect from "./MorphWalletConnect";
import HederaWalletConnect from "./HederaWalletConnect";

const UnifiedWalletConnect = ({ onConnectionChange }) => {
  const [blockdagConnection, setBlockdagConnection] = useState({
    isConnected: false,
    address: null,
    network: null,
  });
  const [solanaConnection, setSolanaConnection] = useState({
    isConnected: false,
    publicKey: null,
    network: null,
    balance: null,
    testnet: {
      isConnected: false,
      publicKey: null,
      balance: null,
    },
    devnet: {
      isConnected: false,
      publicKey: null,
      balance: null,
      usdcBalance: null,
    },
  });
  const [morphConnection, setMorphConnection] = useState({
    isConnected: false,
    address: null,
    network: null,
    balance: null,
    usdtBalance: null,
  });
  const [hederaConnection, setHederaConnection] = useState({
    connected: false,
    address: null,
    network: null,
    balance: null,
  });

  // Use refs to get latest state without triggering re-renders
  const blockdagRef = useRef(blockdagConnection);
  const solanaRef = useRef(solanaConnection);
  const morphRef = useRef(morphConnection);
  const hederaRef = useRef(hederaConnection);

  // Update refs when state changes
  blockdagRef.current = blockdagConnection;
  solanaRef.current = solanaConnection;
  morphRef.current = morphConnection;
  hederaRef.current = hederaConnection;

  // Stable callback functions that won't cause infinite loops
  const handleBlockdagConnection = useCallback(
    (connection) => {
      setBlockdagConnection(connection);

      // Notify parent with combined connection status using refs for latest state
      if (onConnectionChange) {
        onConnectionChange({
          blockdag: connection,
          solana: solanaRef.current,
          morph: morphRef.current,
          hedera: hederaRef.current,
          hasAnyConnection:
            connection.isConnected ||
            solanaRef.current.isConnected ||
            morphRef.current.isConnected ||
            hederaRef.current.isConnected,
        });
      }
    },
    [onConnectionChange]
  );

  const handleSolanaConnection = useCallback(
    (connection) => {
      // Update the specific network connection
      setSolanaConnection((prev) => {
        const updated = {
          ...prev,
          [connection.networkType]: {
            isConnected: connection.isConnected,
            publicKey: connection.publicKey,
            balance: connection.balance,
            usdcBalance: connection.usdcBalance,
            wallet: connection.wallet,
            network: connection.network,
          },
        };

        // Update the main connection status
        updated.isConnected =
          updated.testnet.isConnected || updated.devnet.isConnected;
        updated.network = connection.network;

        return updated;
      });

      // Notify parent with combined connection status using refs for latest state
      if (onConnectionChange) {
        onConnectionChange({
          blockdag: blockdagRef.current,
          solana: {
            ...connection,
            hasMultiNetwork: true,
          },
          morph: morphRef.current,
          hedera: hederaRef.current,
          hasAnyConnection:
            blockdagRef.current.isConnected ||
            connection.isConnected ||
            morphRef.current.isConnected ||
            hederaRef.current.isConnected,
        });
      }
    },
    [onConnectionChange]
  );

  const handleMorphConnection = useCallback(
    (connection) => {
      setMorphConnection(connection);

      // Notify parent with combined connection status using refs for latest state
      if (onConnectionChange) {
        onConnectionChange({
          blockdag: blockdagRef.current,
          solana: solanaRef.current,
          morph: connection,
          hedera: hederaRef.current,
          hasAnyConnection:
            blockdagRef.current.isConnected ||
            solanaRef.current.isConnected ||
            connection.isConnected ||
            hederaRef.current.isConnected,
        });
      }
    },
    [onConnectionChange]
  );

  const handleHederaConnection = useCallback(
    (connection) => {
      setHederaConnection(connection);

      // Notify parent with combined connection status using refs for latest state
      if (onConnectionChange) {
        onConnectionChange({
          blockdag: blockdagRef.current,
          solana: solanaRef.current,
          morph: morphRef.current,
          hedera: connection,
          hasAnyConnection:
            blockdagRef.current.isConnected ||
            solanaRef.current.isConnected ||
            morphRef.current.isConnected ||
            connection.connected ||
            connection.isConnected, // Support both property names
        });
      }
    },
    [onConnectionChange]
  );

  return (
    <div className="w-full space-y-4">
      {/* Connection Status Summary */}
      {(blockdagConnection.isConnected ||
        solanaConnection.isConnected ||
        morphConnection.isConnected ||
        hederaConnection.isConnected) && (
        <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">
                Multi-Chain Wallet Connected
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm">
              {/* BlockDAG Status */}
              <div className="space-y-1">
                <p className="text-slate-400">BlockDAG Network</p>
                <div className="flex items-center gap-2">
                  {blockdagConnection.isConnected ? (
                    <>
                      <Badge
                        variant="outline"
                        className="border-purple-400 text-purple-400"
                      >
                        Connected
                      </Badge>
                      <span className="text-purple-300 text-xs">
                        Primordial Testnet
                      </span>
                    </>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-slate-500 text-slate-500"
                    >
                      Not Connected
                    </Badge>
                  )}
                </div>
              </div>

              {/* Solana Status */}
              <div className="space-y-1">
                <p className="text-slate-400">Solana Networks</p>
                <div className="flex flex-col gap-1">
                  {solanaConnection.testnet.isConnected ? (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-blue-400 text-blue-400"
                      >
                        Testnet
                      </Badge>
                      <span className="text-blue-300 text-xs">
                        {solanaConnection.testnet.balance !== null
                          ? `${solanaConnection.testnet.balance.toFixed(2)} SOL`
                          : "Connected"}
                      </span>
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-slate-500 text-slate-500"
                    >
                      Testnet: Not Connected
                    </Badge>
                  )}

                  {solanaConnection.devnet.isConnected ? (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-purple-400 text-purple-400"
                      >
                        Devnet
                      </Badge>
                      <span className="text-purple-300 text-xs">
                        {solanaConnection.devnet.usdcBalance !== null
                          ? `${solanaConnection.devnet.usdcBalance.toFixed(
                              2
                            )} USDC`
                          : "Connected"}
                      </span>
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-slate-500 text-slate-500"
                    >
                      Devnet: Not Connected
                    </Badge>
                  )}
                </div>
              </div>

              {/* Morph Status */}
              <div className="space-y-1">
                <p className="text-slate-400">Morph Holesky</p>
                <div className="flex items-center gap-2">
                  {morphConnection.isConnected ? (
                    <>
                      <Badge
                        variant="outline"
                        className="border-green-400 text-green-400"
                      >
                        Connected
                      </Badge>
                      <span className="text-green-300 text-xs">
                        {morphConnection.usdtBalance !== null
                          ? `${morphConnection.usdtBalance} USDT`
                          : "Testnet"}
                      </span>
                    </>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-slate-500 text-slate-500"
                    >
                      Not Connected
                    </Badge>
                  )}
                </div>
              </div>

              {/* Hedera Status */}
              <div className="space-y-1">
                <p className="text-slate-400">Hedera Testnet</p>
                <div className="flex items-center gap-2">
                  {hederaConnection.connected ? (
                    <>
                      <Badge
                        variant="outline"
                        className="border-purple-400 text-purple-400"
                      >
                        Connected
                      </Badge>
                      <span className="text-purple-300 text-xs">
                        {hederaConnection.balance !== null
                          ? `${hederaConnection.balance.toFixed(4)} HBAR`
                          : "HBAR Ready"}
                      </span>
                    </>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-slate-500 text-slate-500"
                    >
                      Not Connected
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Tabs */}
      <Tabs defaultValue="blockdag" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
          <TabsTrigger value="blockdag" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            BlockDAG
          </TabsTrigger>
          <TabsTrigger value="solana" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Solana
          </TabsTrigger>
          <TabsTrigger value="morph" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Morph
          </TabsTrigger>
          <TabsTrigger value="hedera" className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-magenta-500 rounded-full"></div>
            Hedera
          </TabsTrigger>
        </TabsList>

        {/* BlockDAG Wallet Tab */}
        <TabsContent value="blockdag" className="mt-4 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-medium text-white">BlockDAG Wallet</h3>
            <Badge
              variant="outline"
              className="border-purple-400 text-purple-400"
            >
              Primary Payment Network
            </Badge>
          </div>

          <ThirdWebWalletConnect
            onConnectionChange={handleBlockdagConnection}
          />

          {/* BlockDAG Info */}
          <Card className="bg-purple-900/20 border-purple-500/30">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-purple-200 text-sm font-medium">
                    Used for AR Agent Payments
                  </p>
                  <p className="text-purple-300 text-xs">
                    Connect to BlockDAG Primordial Testnet to pay agents with
                    USBDG+ tokens
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-purple-400 text-xs">
                      Network: Primordial Testnet
                    </span>
                    <a
                      href="https://explorer.blockdag.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solana Wallet Tab */}
        <TabsContent value="solana" className="mt-4 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">Solana Wallets</h3>
            <Badge variant="outline" className="border-blue-400 text-blue-400">
              Multi-Network
            </Badge>
          </div>

          {/* Solana Network Selector */}
          <div className="space-y-4">
            {/* Solana Testnet */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-blue-200 text-sm font-medium">
                  Solana Testnet (SOL Payments)
                </span>
              </div>
              <SolanaWalletConnect
                network="testnet"
                onConnectionChange={(connection) => {
                  handleSolanaConnection({
                    ...connection,
                    networkType: "testnet",
                  });
                }}
              />
            </div>

            {/* Solana Devnet */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-purple-200 text-sm font-medium">
                  Solana Devnet (USDC Payments)
                </span>
              </div>
              <SolanaWalletConnect
                network="devnet"
                onConnectionChange={(connection) => {
                  handleSolanaConnection({
                    ...connection,
                    networkType: "devnet",
                  });
                }}
              />
            </div>
          </div>

          {/* Solana Info */}
          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-blue-200 text-sm font-medium">
                    Dual Network Support
                  </p>
                  <p className="text-blue-300 text-xs">
                    Connect to both Testnet (SOL) and Devnet (USDC) for
                    different payment options
                  </p>
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 text-xs">
                        Testnet: SOL payments
                      </span>
                      <a
                        href="https://explorer.solana.com/?cluster=testnet"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:text-blue-200"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 text-xs">
                        Devnet: USDC payments
                      </span>
                      <a
                        href="https://explorer.solana.com/?cluster=devnet"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-300 hover:text-purple-200"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Morph Wallet Tab */}
        <TabsContent value="morph" className="mt-4 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-medium text-white">
              Morph Holesky Wallet
            </h3>
            <Badge
              variant="outline"
              className="border-green-400 text-green-400"
            >
              EVM Compatible
            </Badge>
          </div>

          <MorphWalletConnect onConnectionChange={handleMorphConnection} />

          {/* Morph Info */}
          <Card className="bg-green-900/20 border-green-500/30">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-green-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-green-200 text-sm font-medium">
                    USDT Payments on Morph L2
                  </p>
                  <p className="text-green-300 text-xs">
                    Connect MetaMask to Morph Holesky testnet for 1 USDT
                    payments to agents
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-green-400 text-xs">
                      Network: Morph Holesky (Chain ID: 2810)
                    </span>
                    <a
                      href="https://explorer-holesky.morphl2.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-300 hover:text-green-200"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hedera Wallet Tab */}
        <TabsContent value="hedera" className="mt-4 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-magenta-500 rounded-full"></div>
            <h3 className="text-lg font-medium text-white">
              Hedera Testnet Wallet
            </h3>
            <Badge
              variant="outline"
              className="border-purple-400 text-purple-400"
            >
              HBAR Payments
            </Badge>
          </div>

          <HederaWalletConnect onConnectionChange={handleHederaConnection} />

          {/* Hedera Info */}
          <Card className="bg-purple-900/20 border-purple-500/30">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-purple-200 text-sm font-medium">
                    HBAR Payments on Hedera Network
                  </p>
                  <p className="text-purple-300 text-xs">
                    Connect MetaMask to Hedera Testnet for 1 HBAR payments to
                    agents
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-purple-400 text-xs">
                      Network: Hedera Testnet (Chain ID: 296)
                    </span>
                    <a
                      href="https://hashscan.io/testnet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      {(blockdagConnection.isConnected ||
        solanaConnection.isConnected ||
        morphConnection.isConnected ||
        hederaConnection.connected) && (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {blockdagConnection.isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-400 text-purple-400 hover:bg-purple-700/20"
                >
                  View BlockDAG Transactions
                </Button>
              )}
              {solanaConnection.isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-400 text-blue-400 hover:bg-blue-700/20"
                >
                  View Solana Transactions
                </Button>
              )}
              {morphConnection.isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-400 text-green-400 hover:bg-green-700/20"
                >
                  View Morph Transactions
                </Button>
              )}
              {hederaConnection.connected && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-400 text-purple-400 hover:bg-purple-700/20"
                >
                  View Hedera Transactions
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedWalletConnect;
