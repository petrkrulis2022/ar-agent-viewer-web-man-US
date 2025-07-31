import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  QrCode,
  Copy,
  CheckCircle,
  Clock,
  Wallet,
  ExternalLink,
  RefreshCw,
  Eye,
  Zap,
  Bot,
  Network,
} from "lucide-react";
import QRCode from "react-qr-code";
import { USBDGToken, ContractAddresses } from "../config/blockdag-chain";
import { MorphUSDTToken } from "../config/morph-holesky-chain";
import ARQRCodeEnhanced from "./ARQRCodeEnhanced";
import qrCodeService from "../services/qrCodeService";
import arQRManager from "../services/arQRManager";
import solanaPaymentService from "../services/solanaPaymentService";
import morphPaymentService from "../services/morphPaymentService";

const EnhancedPaymentQRModal = ({
  agent,
  isOpen,
  onClose,
  onPaymentComplete,
  onARQRGenerated,
  onScanARQR,
  userLocation,
}) => {
  const [paymentData, setPaymentData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [arQRCodes, setArQRCodes] = useState([]);
  const [showARView, setShowARView] = useState(false);
  const [isGeneratingAR, setIsGeneratingAR] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("blockdag"); // "blockdag", "solana", or "morph"

  // Generate payment QR code data
  useEffect(() => {
    if (isOpen && agent) {
      const generatePayment = async () => {
        const payment = await generatePaymentData(agent, selectedNetwork);
        setPaymentData(payment);
        setTimeLeft(300);
        setShowARView(false); // Reset AR view when network changes
      };
      generatePayment();
    }
  }, [isOpen, agent, selectedNetwork]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPaymentStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Generate payment data with BlockDAG configuration
  const generatePaymentData = async (agent, network = "blockdag") => {
    if (network === "solana") {
      // Generate Solana payment data
      const solanaPayment = solanaPaymentService.generateSolanaAgentPayment(
        agent,
        1
      );
      const qrData =
        solanaPaymentService.generateSolanaPaymentQRData(solanaPayment);

      // Test and validate the QR code
      const testResult = solanaPaymentService.testSolanaPayQR(agent);
      console.log("🧪 Solana QR Test Result:", testResult);

      // Generate comprehensive test report
      solanaPaymentService.generateQRTestReport(agent).then((report) => {
        console.log("📋 Comprehensive Test Report:", report);
      });

      return {
        ...solanaPayment,
        qrData,
        transactionId: `sol_tx_${Date.now()}_${agent.id}`,
        explorerUrl: `https://explorer.solana.com/?cluster=testnet`,
        networkName: "Solana Testnet",
        network: "solana",
      };
    } else if (network === "morph") {
      // Generate Morph Holesky payment data (async to get connected wallet)
      const morphPayment = await morphPaymentService.generateMorphAgentPayment(
        agent,
        1
      );
      const qrData =
        morphPaymentService.generateMorphPaymentQRData(morphPayment);

      // Generate all QR formats for testing
      const allFormats =
        morphPaymentService.generateMorphQRFormats(morphPayment);
      console.log("🧪 Testing all QR formats:");
      console.log("📱 Try these in your wallet if the main one doesn't work:");
      console.log("1. Wallet-friendly:", allFormats.walletFriendly);
      console.log("2. Standard EIP-681:", allFormats.standard);
      console.log("3. Basic format:", allFormats.basic);
      console.log("4. Function call:", allFormats.functionCall);

      // Test and validate the QR code
      const testResult = await morphPaymentService.testMorphPaymentQR(agent);
      console.log("🧪 Morph QR Test Result:", testResult);

      // Generate comprehensive test report
      morphPaymentService.generateMorphQRTestReport(agent).then((report) => {
        console.log("📋 Morph Test Report:", report);
      });

      return {
        ...morphPayment,
        qrData,
        transactionId: `morph_tx_${Date.now()}_${agent.id}`,
        explorerUrl: `https://explorer-holesky.morphl2.io`,
        networkName: "Morph Holesky",
        network: "morph",
      };
    } else {
      // Generate BlockDAG payment data (original)
      const amount = "50"; // 50 USBDG+ tokens
      const integerAmount = Math.floor(Number(amount));

      const paymentInfo = {
        amount: integerAmount,
        recipient:
          agent.wallet_address || "0x1234567890123456789012345678901234567890",
        contractAddress: USBDGToken.address,
        chainId: "1043", // BlockDAG Primordial Testnet
        agentId: agent.id,
        agentName: agent.name,
      };

      // Generate EIP-681 format QR data
      const qrData = qrCodeService.generatePaymentQRData(paymentInfo);

      return {
        ...paymentInfo,
        qrData,
        transactionId: `tx_${Date.now()}_${agent.id}`,
        explorerUrl: `https://test-explorer.primordial.bdagscan.com/`,
        networkName: "BlockDAG Primordial Testnet",
        network: "blockdag",
      };
    }
  };

  // Generate AR QR Code with decoupled display logic
  const handleGenerateARQR = async () => {
    if (!paymentData || !agent) return;

    setIsGeneratingAR(true);

    try {
      // 1. IMMEDIATE AR DISPLAY - Generate QR locally first
      const arPosition = qrCodeService.generateARPosition(
        agent.position || { x: 0, y: 0, z: 0 },
        userLocation,
        0
      );

      // 2. Create QR data for immediate AR display
      const localQRData = {
        id: `ar_qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        data: paymentData.qrData,
        position: arPosition,
        size: 1.5,
        status: "active",
        agent: agent,
        agentId: agent.id,
        transactionId: paymentData.transactionId,
        amount: paymentData.amount,
        createdAt: Date.now(),
        expiresAt: Date.now() + (timeLeft * 1000)
      };

      // 3. IMMEDIATELY show in AR using AR QR Manager (don't wait for database)
      const arQRId = arQRManager.addQR(
        localQRData.id,
        paymentData.qrData,
        arPosition,
        {
          size: 1.5,
          agentId: agent.id,
          ttl: timeLeft * 1000,
          metadata: {
            agent: agent,
            amount: paymentData.amount,
            transactionId: paymentData.transactionId
          }
        }
      );

      // 4. Update local state for modal display
      setArQRCodes([localQRData]);
      setShowARView(true);

      console.log("✅ AR QR Code displayed immediately via AR Manager:", arQRId);

      // 4. Notify parent component (AR is now active)
      if (onARQRGenerated) {
        onARQRGenerated(localQRData);
      }

      // 5. BACKGROUND DATABASE SAVE (non-blocking)
      try {
        console.log("🔄 Attempting background save to Supabase...");
        
        const qrCodeData = {
          transactionId: paymentData.transactionId,
          data: paymentData.qrData,
          position: arPosition,
          size: 1.5,
          agentId: agent.id,
          ttl: timeLeft * 1000,
        };

        const createdQR = await qrCodeService.createQRCode(qrCodeData);
        
        if (createdQR) {
          // Update local QR with database ID if save succeeded
          localQRData.id = createdQR.id || localQRData.id;
          localQRData.dbSaveStatus = createdQR.dbSaveStatus || 'saved';
          
          console.log("✅ AR QR background save completed:", {
            id: localQRData.id,
            dbStatus: localQRData.dbSaveStatus
          });
        }
      } catch (dbError) {
        console.warn("⚠️ AR QR database save failed (QR remains active in AR):", dbError);
        localQRData.dbSaveStatus = 'failed';
        localQRData.dbError = dbError.message;
      }

    } catch (error) {
      console.error("❌ Error generating AR QR code:", error);
      // Even if there's an error, we should still try to show something
      const fallbackQR = {
        id: `fallback_${Date.now()}`,
        data: paymentData.qrData,
        position: [0, 1, -2],
        size: 1.5,
        status: "active",
        agent: agent,
        error: error.message
      };
      
      setArQRCodes([fallbackQR]);
      setShowARView(true);
      
      if (onARQRGenerated) {
        onARQRGenerated(fallbackQR);
      }
    } finally {
      setIsGeneratingAR(false);
    }
  };

  // Handle scanning of floating AR QR code (enhanced persistence)
  const handleScanARQR = () => {
    if (!paymentData || !showARView) return;

    console.log("🎯 Closing modal to reveal persistent AR QR code");
    console.log("📊 AR QR Manager stats:", arQRManager.getStats());

    // Important: QR codes remain active in AR QR Manager even after modal closes
    // The user can now see and interact with the floating QR code in AR space
    
    onClose(); // Close the modal

    // Log current AR QR status for debugging
    const activeQRs = arQRManager.getActiveQRs();
    console.log(`✅ ${activeQRs.length} AR QR codes remain active after modal close`);
    
    activeQRs.forEach(qr => {
      console.log(`🔍 Active QR: ${qr.id} at position [${qr.position.join(', ')}]`);
    });

    // Optional: Show a toast notification that QR is still available
    if (window.showNotification) {
      window.showNotification({
        type: 'info',
        message: 'AR QR Code is now floating in space. Tap it to scan!',
        duration: 3000
      });
    }
  };

  // Handle AR QR Code scanning
  const handleARQRScanned = async (qrCode) => {
    try {
      // Update status in Supabase
      await qrCodeService.updateQRCodeStatus(
        qrCode.id,
        qrCodeService.QR_CODE_STATUS.SCANNED
      );

      // Update local state
      setPaymentStatus("completed");

      // Remove QR from AR view
      setArQRCodes((prev) => prev.filter((qr) => qr.id !== qrCode.id));

      // Notify parent
      if (onPaymentComplete) {
        onPaymentComplete({
          ...paymentData,
          qrCodeId: qrCode.id,
          scannedAt: new Date().toISOString(),
        });
      }

      // Auto-close after brief delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error handling QR scan:", error);
    }
  };

  // Copy QR data to clipboard
  const copyToClipboard = async () => {
    if (paymentData?.qrData) {
      await navigator.clipboard.writeText(paymentData.qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Traditional Modal View */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 text-white border-purple-500/30">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <CardTitle className="text-lg">
                  Payment to {agent?.name}
                </CardTitle>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription className="text-purple-200">
              Complete payment using AR QR Code
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Network Selector */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">
                  Payment Network
                </span>
              </div>

              <Tabs
                value={selectedNetwork}
                onValueChange={setSelectedNetwork}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
                  <TabsTrigger
                    value="blockdag"
                    className="flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    BlockDAG
                  </TabsTrigger>
                  <TabsTrigger
                    value="solana"
                    className="flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    Solana
                  </TabsTrigger>
                  <TabsTrigger
                    value="morph"
                    className="flex items-center gap-2"
                  >
                    <Network className="w-4 h-4" />
                    Morph
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Payment Info */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="text-white font-semibold">
                  {selectedNetwork === "solana"
                    ? `${paymentData?.amount} SOL`
                    : selectedNetwork === "morph"
                    ? `${paymentData?.amount} USDT`
                    : `${paymentData?.amount} USBDG+`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Network:</span>
                <span className="text-purple-300">
                  {paymentData?.networkName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time Left:</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span
                    className={timeLeft < 60 ? "text-red-400" : "text-white"}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>

            {/* AR QR Generation */}
            <div className="space-y-4">
              <Button
                onClick={handleGenerateARQR}
                disabled={isGeneratingAR || paymentStatus !== "pending"}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isGeneratingAR ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating AR QR...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Generate Floating AR QR Code
                  </>
                )}
              </Button>

              {showARView && (
                <div className="space-y-3">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-400">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        AR QR Code Active! Close this modal and tap the floating
                        QR code to scan.
                      </span>
                    </div>
                  </div>

                  {/* Scan AR QR Button */}
                  <Button
                    onClick={handleScanARQR}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Close Modal & Tap Floating QR to Scan
                  </Button>
                </div>
              )}
            </div>

            {/* Traditional QR Code */}
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-slate-400 text-sm">
                  Or scan traditional QR:
                </span>
              </div>

              {paymentData && (
                <div className="bg-white p-4 rounded-lg mx-auto w-fit">
                  <QRCode value={paymentData.qrData} size={200} level="M" />
                </div>
              )}

              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/20"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Payment Data
                  </>
                )}
              </Button>

              {/* Network-specific Instructions */}
              <div
                className={`rounded-lg p-3 ${
                  selectedNetwork === "solana"
                    ? "bg-blue-900/20 border border-blue-500/30"
                    : selectedNetwork === "morph"
                    ? "bg-green-900/20 border border-green-500/30"
                    : "bg-purple-900/20 border border-purple-500/30"
                }`}
              >
                <div className="space-y-2">
                  <p
                    className={`text-sm font-medium ${
                      selectedNetwork === "solana"
                        ? "text-blue-200"
                        : selectedNetwork === "morph"
                        ? "text-green-200"
                        : "text-purple-200"
                    }`}
                  >
                    {selectedNetwork === "solana"
                      ? "🦄 Solana Payment Instructions"
                      : selectedNetwork === "morph"
                      ? "🦊 Morph Holesky Payment Instructions"
                      : "⚡ BlockDAG Payment Instructions"}
                  </p>
                  <ul
                    className={`text-xs space-y-1 ${
                      selectedNetwork === "solana"
                        ? "text-blue-300"
                        : selectedNetwork === "morph"
                        ? "text-green-300"
                        : "text-purple-300"
                    }`}
                  >
                    {selectedNetwork === "solana" ? (
                      <>
                        <li>
                          • Use Phantom wallet or Solana-compatible wallet
                        </li>
                        <li>• Connect to Solana Testnet network</li>
                        <li>• Ensure you have SOL for transaction fees</li>
                        <li>• Scan with Solana Pay compatible app</li>
                      </>
                    ) : selectedNetwork === "morph" ? (
                      <>
                        <li>• Use MetaMask or EVM-compatible wallet</li>
                        <li>
                          • Connect to Morph Holesky testnet (Chain ID: 2810)
                        </li>
                        <li>• Ensure you have USDT tokens for payment</li>
                        <li>• Scan with EIP-681 compatible wallet</li>
                      </>
                    ) : (
                      <>
                        <li>• Use MetaMask or BlockDAG-compatible wallet</li>
                        <li>• Connect to BlockDAG Primordial Testnet</li>
                        <li>• Ensure you have USBDG+ tokens for payment</li>
                        <li>• Scan with EIP-681 compatible wallet</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {paymentStatus === "completed" && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-semibold">
                  Payment Completed!
                </p>
                <p className="text-green-300 text-sm">
                  Transaction is being processed
                </p>
              </div>
            )}

            {paymentStatus === "expired" && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                <Clock className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 font-semibold">QR Code Expired</p>
                <p className="text-red-300 text-sm">
                  Please generate a new payment request
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AR QR Code Overlay */}
      {showARView && arQRCodes.length > 0 && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <ARQRCodeEnhanced
            qrCodes={arQRCodes}
            onQRScanned={handleARQRScanned}
            className="pointer-events-auto"
          />
        </div>
      )}
    </>
  );
};

export default EnhancedPaymentQRModal;
