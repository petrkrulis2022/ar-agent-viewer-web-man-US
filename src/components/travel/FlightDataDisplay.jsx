import React from "react";
import { Plane, Clock, Calendar, ArrowRight } from "lucide-react";
import MCPBadge from "./MCPBadge";

const FlightDataDisplay = ({ flightData, onSelect, onCancel }) => {
  if (!flightData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-blue-500/30 w-full max-w-md overflow-hidden shadow-2xl shadow-blue-900/20">
        {/* Header */}
        <div className="bg-gray-800/50 p-4 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white">Flight Found</h3>
          </div>
          <MCPBadge service="Flightradar24" />
        </div>

        {/* Flight Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {flightData.departureCode}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {flightData.departureCity}
              </div>
              <div className="text-sm font-mono text-blue-400 mt-1">
                {flightData.departureTime}
              </div>
            </div>

            <div className="flex-1 px-4 flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-1">
                {flightData.duration}
              </div>
              <div className="w-full h-px bg-gray-700 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 p-1">
                  <Plane className="w-4 h-4 text-gray-500 rotate-90" />
                </div>
              </div>
              <div className="text-xs text-green-400 mt-1">Direct</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {flightData.arrivalCode}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {flightData.arrivalCity}
              </div>
              <div className="text-sm font-mono text-blue-400 mt-1">
                {flightData.arrivalTime}
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Airline</span>
              <span className="text-white font-medium">
                {flightData.airline}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Flight No.</span>
              <span className="text-white font-medium">
                {flightData.flightNumber}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Date</span>
              <span className="text-white font-medium">{flightData.date}</span>
            </div>
            <div className="border-t border-gray-700 pt-2 flex justify-between items-center">
              <span className="text-gray-400">Price</span>
              <span className="text-xl font-bold text-green-400">
                ${flightData.price}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-lg border border-gray-600 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={onSelect}
              className="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              Select Flight <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDataDisplay;
