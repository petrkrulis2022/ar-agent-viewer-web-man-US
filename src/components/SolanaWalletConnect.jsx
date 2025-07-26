import React, { useMemo, useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  LogOut,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
} from "lucide-react";

// Import Solana wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";
import solanaPaymentService from "../services/solanaPaymentService";

// Solana Testnet Configuration
const SOLANA_TESTNET_RPC = "https://api.testnet.solana.com";
const SOLANA_NETWORK = WalletAdapterNetwork.Testnet;

// Wallet Component that uses the Solana wallet context
const SolanaWalletContent = ({ onConnectionChange }) => {
  const { publicKey, connected, connecting, disconnect, wallet } = useWallet();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Create connection to Solana testnet
  const connection = useMemo(() => new Connection(SOLANA_TESTNET_RPC), []);

  // Fetch wallet balance
  const fetchBalance = async () => {
    if (!publicKey || !connected) return;

    setLoading(true);
    try {
      const balance = await connection.getBalance(publicKey);
      // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
      setBalance(balance / 1e9);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    if (!publicKey) return;

    try {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  // Handle wallet connection changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange({
        isConnected: connected,
        publicKey: publicKey?.toBase58(),
        wallet: wallet?.adapter?.name,
        network: "Solana Testnet",
        balance,
      });
    }
  }, [connected, publicKey, wallet, balance, onConnectionChange]);

  // Fetch balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
      // Validate testnet connection
      solanaPaymentService.validateTestnetConnection();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setBalance(null);
      console.log("🔌 Solana wallet disconnected");
    } catch (error) {
      console.error("❌ Disconnect error:", error);
    }
  };

  if (connected && publicKey) {
    return (
      <Card className="w-full bg-gradient-to-br from-purple-900/80 to-blue-900/80 border-purple-500/30 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <CardTitle className="text-lg">Solana Wallet Connected</CardTitle>
            </div>
            <Badge
              variant="outline"
              className="border-green-400 text-green-400"
            >
              Testnet
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Wallet Info */}
          <div className="bg-purple-800/30 rounded-lg p-4 space-y-3">
            {/* Wallet Type */}
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-300" />
              <span className="text-purple-200 text-sm">
                {wallet?.adapter?.name || "Phantom Wallet"}
              </span>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <p className="text-purple-200 text-sm">Wallet Address</p>
              <div className="flex items-center gap-2">
                <code className="text-white text-sm bg-black/30 px-2 py-1 rounded flex-1 break-all">
                  {publicKey.toBase58()}
                </code>
                <Button
                  onClick={copyAddress}
                  variant="ghost"
                  size="sm"
                  className="text-purple-300 hover:bg-purple-700/50"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Balance */}
            <div className="space-y-1">
              <p className="text-purple-200 text-sm">Balance</p>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono">
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : balance !== null ? (
                    `${balance.toFixed(4)} SOL`
                  ) : (
                    "Unable to fetch"
                  )}
                </span>
                <Button
                  onClick={fetchBalance}
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  className="text-purple-300 hover:bg-purple-700/50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>

            {/* Network */}
            <div className="space-y-1">
              <p className="text-purple-200 text-sm">Network</p>
              <div className="flex items-center gap-2">
                <span className="text-green-400">Solana Testnet</span>
                <a
                  href={`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-purple-200"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={fetchBalance}
              variant="outline"
              disabled={loading}
              className="flex-1 border-purple-400 text-purple-300 hover:bg-purple-700/50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh Balance
            </Button>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="border-red-400 text-red-300 hover:bg-red-700/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900/80 to-purple-900/80 border-purple-500/30 text-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-purple-400" />
          <CardTitle className="text-lg">Connect Solana Wallet</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="bg-slate-800/50 rounded-lg p-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            {connecting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                <span className="text-purple-200">Connecting...</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <span className="text-white text-sm">Wallet Not Connected</span>
              </>
            )}
          </div>
          <p className="text-slate-400 text-sm">
            Connect your Phantom wallet to interact with Solana testnet
          </p>
        </div>

        {/* Connect Button */}
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-blue-500 hover:!from-purple-600 hover:!to-blue-600 !border-none !rounded-lg !px-6 !py-3 !text-white !font-medium !transition-all !duration-200" />
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
          <div className="space-y-2">
            <p className="text-blue-200 text-sm font-medium">
              🦄 Connect with Phantom Wallet
            </p>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Install Phantom wallet extension</li>
              <li>• Switch to Solana Testnet network</li>
              <li>• Get testnet SOL from faucet if needed</li>
            </ul>
          </div>
        </div>

        {/* Network Info */}
        <div className="text-center space-y-1">
          <p className="text-slate-400 text-xs">Network: Solana Testnet</p>
          <p className="text-slate-500 text-xs">RPC: {SOLANA_TESTNET_RPC}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Solana Wallet Provider Component
const SolanaWalletConnect = ({ onConnectionChange }) => {
  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // Add more wallets here if needed
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={SOLANA_TESTNET_RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolanaWalletContent onConnectionChange={onConnectionChange} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaWalletConnect;
