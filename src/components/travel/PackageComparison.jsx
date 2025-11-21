import React from "react";
import { Check, X, Info } from "lucide-react";

const PackageComparison = ({ flightData, packageData, onSelectPackage }) => {
  const flightOnlyTotal = flightData.price;
  const packageTotal = packageData.totalPrice;
  const savings = flightOnlyTotal + 150 - packageTotal; // Assuming $150 for separate transfer/hotel booking fees/higher rates

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-blue-500/30 w-full max-w-4xl overflow-hidden shadow-2xl shadow-blue-900/20 flex flex-col md:flex-row">
        {/* Left: Flight Only Option */}
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-gray-800 flex flex-col">
          <h3 className="text-lg font-bold text-gray-400 mb-4">Flight Only</h3>

          <div className="bg-gray-800/30 rounded-xl p-4 mb-4 border border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <span className="text-white font-medium">
                {flightData.airline} Flight
              </span>
              <span className="text-white font-bold">${flightData.price}</span>
            </div>
            <p className="text-xs text-gray-500">
              {flightData.departureCode} → {flightData.arrivalCode}
            </p>
          </div>

          <div className="space-y-3 mb-8 flex-1">
            <div className="flex items-center gap-3 text-gray-500">
              <X className="w-5 h-5 text-red-500/50" />
              <span className="text-sm">No airport transfer included</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <X className="w-5 h-5 text-red-500/50" />
              <span className="text-sm">No hotel booking</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <X className="w-5 h-5 text-red-500/50" />
              <span className="text-sm">Manual coordination required</span>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Total</span>
              <span className="text-2xl font-bold text-white">
                ${flightOnlyTotal}
              </span>
            </div>
            <button className="w-full py-3 rounded-lg border border-gray-600 text-gray-400 font-medium hover:bg-gray-800 transition-colors">
              Select Flight Only
            </button>
          </div>
        </div>

        {/* Right: Full Package Option */}
        <div className="flex-1 p-6 bg-blue-900/10 flex flex-col relative overflow-hidden">
          {/* "Recommended" Badge */}
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            RECOMMENDED
          </div>

          <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
            AgentSphere Package
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
              AI Optimized
            </span>
          </h3>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-4 border border-blue-500/30">
            <div className="flex justify-between items-start mb-2">
              <span className="text-white font-medium">
                {flightData.airline} Flight
              </span>
              <span className="text-green-400 font-bold">Included</span>
            </div>
            <p className="text-xs text-gray-500">
              {flightData.departureCode} → {flightData.arrivalCode}
            </p>
          </div>

          <div className="space-y-3 mb-8 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-900/50 flex items-center justify-center border border-green-500/50">
                <Check className="w-3 h-3 text-green-400" />
              </div>
              <span className="text-sm text-white">
                Premium Airport Transfer (Bus Agent)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-900/50 flex items-center justify-center border border-green-500/50">
                <Check className="w-3 h-3 text-green-400" />
              </div>
              <span className="text-sm text-white">
                {packageData.hotelName} (Hotel Agent)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-900/50 flex items-center justify-center border border-green-500/50">
                <Check className="w-3 h-3 text-green-400" />
              </div>
              <span className="text-sm text-white">
                Seamless A2A Coordination
              </span>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-xs text-green-400 block mb-1">
                  Save ${savings} with bundle
                </span>
                <span className="text-gray-400">Total Package</span>
              </div>
              <span className="text-3xl font-bold text-blue-400">
                ${packageTotal}
              </span>
            </div>
            <button
              onClick={onSelectPackage}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/30"
            >
              Select Full Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageComparison;
