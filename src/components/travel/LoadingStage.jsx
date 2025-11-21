import React from "react";
import { Plane, Users, Package, Loader2 } from "lucide-react";

const LoadingStage = ({ stage, currentOperation, costSoFar }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-blue-500/30 w-full max-w-md p-6 shadow-2xl shadow-blue-900/20">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin relative z-10" />
          </div>
          <h3 className="text-xl font-bold text-white mt-4">
            Planning Your Trip...
          </h3>
          <p className="text-gray-400 text-sm mt-1">{currentOperation}</p>
        </div>

        <div className="space-y-6 relative">
          {/* Connecting Line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-800 -z-0"></div>

          {/* Step 1: MCP Query */}
          <div className="flex items-start gap-4 relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                stage === "mcp-query"
                  ? "bg-blue-900/50 border-blue-500 text-blue-400 animate-pulse"
                  : stage !== "mcp-query" // Completed
                  ? "bg-green-900/50 border-green-500 text-green-400"
                  : "bg-gray-800 border-gray-700 text-gray-600"
              }`}
            >
              <Plane className="w-5 h-5" />
            </div>
            <div className="flex-1 pt-1">
              <div className="flex justify-between items-center">
                <h4
                  className={`font-medium ${
                    stage === "mcp-query" || stage !== "mcp-query"
                      ? "text-white"
                      : "text-gray-500"
                  }`}
                >
                  Querying flight data
                </h4>
                {(stage === "mcp-query" || stage !== "mcp-query") && (
                  <span className="text-xs font-mono text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">
                    0.00022 USDH
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Flightradar24 MCP via x402
              </p>
            </div>
          </div>

          {/* Step 2: A2A Coordination */}
          <div className="flex items-start gap-4 relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                stage === "a2a-coordination"
                  ? "bg-blue-900/50 border-blue-500 text-blue-400 animate-pulse"
                  : stage === "package-assembly" || stage === "complete" // Completed
                  ? "bg-green-900/50 border-green-500 text-green-400"
                  : "bg-gray-800 border-gray-700 text-gray-600"
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 pt-1">
              <div className="flex justify-between items-center">
                <h4
                  className={`font-medium ${
                    stage === "a2a-coordination" ||
                    stage === "package-assembly" ||
                    stage === "complete"
                      ? "text-white"
                      : "text-gray-500"
                  }`}
                >
                  Coordinating agents
                </h4>
                {(stage === "a2a-coordination" ||
                  stage === "package-assembly" ||
                  stage === "complete") && (
                  <span className="text-xs font-mono text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded">
                    A2A Protocol
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Bus, Train, Hotel agents
              </p>
            </div>
          </div>

          {/* Step 3: Package Assembly */}
          <div className="flex items-start gap-4 relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                stage === "package-assembly"
                  ? "bg-blue-900/50 border-blue-500 text-blue-400 animate-pulse"
                  : stage === "complete"
                  ? "bg-green-900/50 border-green-500 text-green-400"
                  : "bg-gray-800 border-gray-700 text-gray-600"
              }`}
            >
              <Package className="w-5 h-5" />
            </div>
            <div className="flex-1 pt-1">
              <h4
                className={`font-medium ${
                  stage === "package-assembly" || stage === "complete"
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                Assembling package
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Comparing options & pricing
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-800 flex justify-between items-center">
          <span className="text-sm text-gray-400">Total query cost:</span>
          <span className="font-mono text-blue-400 font-bold">
            {costSoFar} USDH
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingStage;
