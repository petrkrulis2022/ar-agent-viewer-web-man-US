import React from "react";
import { CheckCircle, Download, Home } from "lucide-react";

const ConfirmationScreen = ({ onReset }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-green-500/30 w-full max-w-md overflow-hidden shadow-2xl shadow-green-900/20 text-center p-8">
        <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
          <CheckCircle className="w-10 h-10 text-green-400 relative z-10" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-gray-400 mb-8">
          Your complete travel package has been booked successfully via
          AgentSphere.
        </p>

        <div className="bg-gray-800/50 rounded-xl p-4 mb-8 text-left space-y-3 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-300">Flight tickets issued</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-300">
              Airport transfer scheduled
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-300">
              Hotel reservation confirmed
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full py-3 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 border border-gray-700">
            <Download className="w-4 h-4" /> Download Itinerary
          </button>
          <button
            onClick={onReset}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Back to AR View
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
