import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  QrCode, 
  Copy, 
  CheckCircle, 
  Clock, 
  Wallet,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import QRCode from 'react-qr-code';

const PaymentQRModal = ({ 
  agent, 
  isOpen, 
  onClose, 
  onPaymentComplete,
  connectedWallet // Add connected wallet address prop
}) => {
  const [paymentData, setPaymentData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, completed, expired

  // Generate payment QR code data
  useEffect(() => {
    if (isOpen && agent) {
      const payment = generatePaymentData(agent);
      setPaymentData(payment);
      setTimeLeft(300);
      setPaymentStatus('pending');
    }
  }, [isOpen, agent]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPaymentStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Generate EIP-681 compliant payment data
  const generatePaymentData = (agent) => {
    const amount = '10'; // 10 USBDG+ (integer instead of decimal)
    const contractAddress = '0xFAD0070d0388FB3F18F1100A5FFc67dF8834D9db'; // USBDG+ token contract on Primordial
    const chainId = '1043'; // BlockDAG Primordial Testnet
    
    // Use connected wallet address as recipient (the website owner/agent operator)
    // The person scanning/paying sends USBDG+ to the connected wallet
    const recipientAddress = connectedWallet || agent.wallet_address || '0x742d35Cc6634C0532925a3b8D4C9db96c4b4c8b6'; // Fallback address
    
    // Debug logging
    console.log('🔧 PaymentQRModal Debug:');
    console.log('- Connected Wallet:', connectedWallet);
    console.log('- Agent Wallet:', agent.wallet_address);
    console.log('- Final Recipient:', recipientAddress);
    console.log('- Amount:', amount, 'USBDG+');
    
    // Validate recipient address
    if (!recipientAddress || recipientAddress === '0x742d35Cc6634C0532925a3b8D4C9db96c4b4c8b6') {
      console.warn('⚠️ Using fallback recipient address - wallet may not be connected');
    }
    
    // Convert amount to wei (18 decimals for USBDG+)
    const amountInWei = (parseFloat(amount) * Math.pow(10, 18)).toString();
    
    // EIP-681 format for MetaMask compatibility with ERC-20 token transfer
    const eip681Uri = `ethereum:${contractAddress}@${chainId}/transfer?address=${recipientAddress}&uint256=${amountInWei}`;
    
    // Alternative format for better MetaMask compatibility
    const metamaskUri = `https://metamask.app.link/send/${contractAddress}@${chainId}/transfer?address=${recipientAddress}&uint256=${amountInWei}`;
    
    console.log('- Generated URI:', eip681Uri);
    
    return {
      uri: eip681Uri,
      metamaskUri: metamaskUri,
      amount,
      amountInWei,
      token: 'USBDG+',
      contractAddress,
      recipient: recipientAddress,
      chainId,
      network: 'BlockDAG Primordial Testnet',
      rpcUrl: 'https://test-rpc.primordial.bdagscan.com/',
      explorerUrl: 'https://explorer-testnet.blockdag.org',
      agentName: agent.name,
      description: `Payment for ${agent.name} interaction - 10 USBDG+`
    };
  };

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Format time remaining
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate payment completion (in real app, this would be detected via blockchain)
  const simulatePayment = () => {
    setPaymentStatus('completed');
    setTimeout(() => {
      if (onPaymentComplete) {
        onPaymentComplete(agent, paymentData);
      }
      onClose();
    }, 2000);
  };

  if (!isOpen || !agent || !paymentData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-purple-500/30 text-white">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-white">Payment QR Code</CardTitle>
              <CardDescription className="text-purple-100">
                Pay {paymentData.amount} {paymentData.token} to {agent.name}
              </CardDescription>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {paymentStatus === 'pending' && (
            <>
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <QRCode
                    value={paymentData.uri}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              </div>

              {/* Timer */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-mono text-lg">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">QR code expires in</p>
              </div>

              {/* Payment Details */}
              <div className="bg-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-white font-semibold">{paymentData.amount} {paymentData.token}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-purple-400">{paymentData.network}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Token Contract:</span>
                  <span className="text-blue-400 font-mono text-xs">{paymentData.contractAddress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Recipient:</span>
                  <span className="text-green-400 font-mono text-xs">{paymentData.recipient}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Agent:</span>
                  <span className="text-white">{agent.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Chain ID:</span>
                  <span className="text-yellow-400">{paymentData.chainId}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-300 font-medium mb-2">How to Pay:</h4>
                <ol className="text-blue-100 text-sm space-y-1">
                  <li>1. Click "Open in MetaMask" or scan QR code</li>
                  <li>2. Add BlockDAG Primordial Testnet if prompted</li>
                  <li>3. Confirm the USBDG+ token transfer</li>
                  <li>4. Wait for transaction confirmation</li>
                </ol>
                <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded">
                  <p className="text-yellow-200 text-xs">
                    <strong>Note:</strong> Make sure you have USBDG+ tokens on Primordial testnet
                  </p>
                </div>
                {!connectedWallet && (
                  <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded">
                    <p className="text-red-200 text-xs">
                      <strong>Warning:</strong> No wallet connected. Payment will go to fallback address. Connect your wallet in the Wallet tab for proper recipient setup.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => window.open(paymentData.metamaskUri, '_blank')}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Open in MetaMask
                </Button>

                <Button
                  onClick={() => copyToClipboard(paymentData.uri)}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Payment URI
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => window.open(paymentData.explorerUrl, '_blank')}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>

                {/* Demo Payment Button */}
                <Button
                  onClick={simulatePayment}
                  variant="outline"
                  className="w-full border-green-500 text-green-400 hover:bg-green-500/20"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Simulate Payment (Demo)
                </Button>
              </div>
            </>
          )}

          {paymentStatus === 'completed' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Payment Successful!</h3>
                <p className="text-green-400">
                  {paymentData.amount} {paymentData.token} sent to {agent.name}
                </p>
              </div>
              <Badge className="bg-green-500 text-white">
                Transaction Confirmed
              </Badge>
            </div>
          )}

          {paymentStatus === 'expired' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">QR Code Expired</h3>
                <p className="text-red-400">
                  This payment QR code has expired for security reasons.
                </p>
              </div>
              <Button
                onClick={() => {
                  const newPayment = generatePaymentData(agent);
                  setPaymentData(newPayment);
                  setTimeLeft(300);
                  setPaymentStatus('pending');
                }}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New QR Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentQRModal;

