import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import ARViewer from "./components/ARViewer";
import MainLandingScreen from "./components/MainLandingScreen";
import CameraActivationScreen from "./components/CameraActivationScreen";
import CubePaymentDemo from "./components/CubePaymentDemo";
import SimpleCubeTest from "./components/SimpleCubeTest";
import CameraTest from "./components/CameraTest";
import UnifiedWalletConnect from "./components/UnifiedWalletConnect";
import ThirdWebProviderWrapper from "./providers/ThirdWebProvider";
import NotificationProvider, {
  useNotifications,
  createGlobalNotificationFunctions,
} from "./components/NotificationProvider";
import databaseInspector from "./utils/databaseInspector";
import "./App.css";

// Make database inspector available globally for debugging
window.databaseInspector = databaseInspector;

function AppContent() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletConnection, setWalletConnection] = useState({
    isConnected: false,
    address: null,
  });

  // Create global notification functions
  React.useEffect(() => {
    createGlobalNotificationFunctions(notifications);
  }, [notifications]);

  const handleWalletConnectionChange = (connection) => {
    setWalletConnection(connection);
  };

  const handleShowWallet = () => {
    setShowWalletModal(true);
  };

  const handleCloseWallet = () => {
    setShowWalletModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Routes>
        {/* Main Landing Screen Route */}
        <Route
          path="/"
          element={
            <MainLandingScreen
              onEnterAgentWorld={() => navigate("/camera-activation")}
              onShowWallet={handleShowWallet}
            />
          }
        />

        {/* Simple Cube Test Route */}
        <Route path="/test-cube" element={<SimpleCubeTest />} />

        {/* 3D Cube Payment Demo Route */}
        <Route path="/cube-demo" element={<CubePaymentDemo />} />

        {/* Camera Debug Test Route */}
        <Route path="/camera-test" element={<CameraTest />} />

        {/* Camera Activation Screen Route */}
        <Route
          path="/camera-activation"
          element={
            <CameraActivationScreen
              onStartCamera={() => navigate("/ar-view")}
              onGoBack={() => navigate("/")}
            />
          }
        />

        {/* AR Viewer Route */}
        <Route path="/ar-view" element={<ARViewer />} />

        {/* Redirect any unknown routes to main landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
              <button
                onClick={handleCloseWallet}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <UnifiedWalletConnect
              onConnectionChange={handleWalletConnectionChange}
            />

            {walletConnection.isConnected && (
              <div className="mt-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
                <p className="text-green-400 text-sm font-medium">
                  Wallet Connected Successfully!
                </p>
                <p className="text-green-300 text-xs mt-1">
                  {walletConnection.address &&
                    `${walletConnection.address.slice(
                      0,
                      6
                    )}...${walletConnection.address.slice(-4)}`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ThirdWebProviderWrapper>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </ThirdWebProviderWrapper>
  );
}

export default App;
