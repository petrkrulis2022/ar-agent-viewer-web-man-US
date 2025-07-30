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
  });
  const [morphConnection, setMorphConnection] = useState({
    isConnected: false,
    address: null,
    network: null,
    balance: null,
    usdtBalance: null,
  });

  // Use refs to get latest state without triggering re-renders
  const blockdagRef = useRef(blockdagConnection);
  const solanaRef = useRef(solanaConnection);
  const morphRef = useRef(morphConnection);

  // Update refs when state changes
  blockdagRef.current = blockdagConnection;
  solanaRef.current = solanaConnection;
  morphRef.current = morphConnection;

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
          hasAnyConnection:
            connection.isConnected ||
            solanaRef.current.isConnected ||
            morphRef.current.isConnected,
        });
      }
    },
    [onConnectionChange]
  );

  const handleSolanaConnection = useCallback(
    (connection) => {
      setSolanaConnection(connection);

      // Notify parent with combined connection status using refs for latest state
      if (onConnectionChange) {
        onConnectionChange({
          blockdag: blockdagRef.current,
          solana: connection,
          morph: morphRef.current,
          hasAnyConnection:
            blockdagRef.current.isConnected ||
            connection.isConnected ||
            morphRef.current.isConnected,
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
          hasAnyConnection:
            blockdagRef.current.isConnected ||
            solanaRef.current.isConnected ||
            connection.isConnected,
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
        morphConnection.isConnected) && (
        <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">
                Multi-Chain Wallet Connected
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
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
                <p className="text-slate-400">Solana Network</p>
                <div className="flex items-center gap-2">
                  {solanaConnection.isConnected ? (
                    <>
                      <Badge
                        variant="outline"
                        className="border-blue-400 text-blue-400"
                      >
                        Connected
                      </Badge>
                      <span className="text-blue-300 text-xs">
                        {solanaConnection.balance !== null
                          ? `${solanaConnection.balance.toFixed(2)} SOL`
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Tabs */}
      <Tabs defaultValue="blockdag" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
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
            <h3 className="text-lg font-medium text-white">Solana Wallet</h3>
            <Badge variant="outline" className="border-blue-400 text-blue-400">
              Secondary Network
            </Badge>
          </div>

          <SolanaWalletConnect onConnectionChange={handleSolanaConnection} />

          {/* Solana Info */}
          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-blue-200 text-sm font-medium">
                    Alternative Payment Method
                  </p>
                  <p className="text-blue-300 text-xs">
                    Connect Phantom wallet for Solana-based transactions and
                    future integrations
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-blue-400 text-xs">
                      Network: Solana Testnet
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
      </Tabs>

      {/* Quick Actions */}
      {(blockdagConnection.isConnected ||
        solanaConnection.isConnected ||
        morphConnection.isConnected) && (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedWalletConnect;
