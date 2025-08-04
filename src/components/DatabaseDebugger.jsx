import React, { useState, useEffect } from "react";
import { supabase, debugSupabaseConfig } from "../lib/supabase.js";
import { Button } from "./ui/button.jsx";

const DatabaseDebugger = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runDatabaseTest = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log("🔧 Running database debug test...");
      debugSupabaseConfig();

      // Test 1: Basic connection
      console.log("Testing basic connection...");
      const { data: testData, error: testError } = await supabase
        .from("deployed_objects")
        .select("id")
        .limit(1);

      if (testError) {
        console.error("Connection test failed:", testError);
        setError(`Connection failed: ${testError.message}`);
        setLoading(false);
        return;
      }

      console.log("Connection successful!");

      // Test 2: Count all records
      const { count, error: countError } = await supabase
        .from("deployed_objects")
        .select("id", { count: "exact", head: true });

      // Test 3: Get all agents with basic columns only
      const { data: allAgents, error: allError } = await supabase.from(
        "deployed_objects"
      ).select(`
          id,
          name,
          description,
          latitude,
          longitude,
          altitude,
          object_type,
          is_active,
          created_at,
          user_id
        `);

      if (allError) {
        console.error("All agents query failed:", allError);
        setError(`Query failed: ${allError.message}`);
        setLoading(false);
        return;
      }

      // Test 4: Get active agents with basic columns
      const { data: activeAgents, error: activeError } = await supabase
        .from("deployed_objects")
        .select(
          `
          id,
          name,
          description,
          latitude,
          longitude,
          altitude,
          object_type,
          is_active,
          created_at,
          user_id
        `
        )
        .eq("is_active", true);

      const results = {
        connectionSuccess: true,
        totalCount: count || 0,
        totalAgents: allAgents?.length || 0,
        activeAgents: activeAgents?.length || 0,
        agents: allAgents || [],
        activeAgentsList: activeAgents || [],
      };

      console.log("Database test results:", results);
      setResults(results);
    } catch (err) {
      console.error("Database test error:", err);
      setError(`Test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run test on component mount
    runDatabaseTest();
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-slate-800 border border-white/20 rounded-lg p-4 max-w-md z-50">
      <h3 className="text-lg font-bold text-green-400 mb-2">Database Debug</h3>

      <Button
        onClick={runDatabaseTest}
        disabled={loading}
        className="mb-3 bg-blue-500 hover:bg-blue-600"
      >
        {loading ? "Testing..." : "Test Database"}
      </Button>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded p-2 mb-2">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {results && (
        <div className="bg-slate-700/50 rounded p-3 text-sm text-white">
          <p>
            <strong>Connection:</strong>{" "}
            {results.connectionSuccess ? "✅ Success" : "❌ Failed"}
          </p>
          <p>
            <strong>Total Records:</strong> {results.totalCount}
          </p>
          <p>
            <strong>Total Agents:</strong> {results.totalAgents}
          </p>
          <p>
            <strong>Active Agents:</strong> {results.activeAgents}
          </p>

          {results.agents.length > 0 ? (
            <div className="mt-2">
              <p>
                <strong>Agent List:</strong>
              </p>
              <div className="max-h-32 overflow-y-auto text-xs mt-1">
                {results.agents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="border-b border-slate-600 py-1"
                  >
                    <p>
                      <strong>{agent.name || "Unnamed"}</strong>
                    </p>
                    <p>Type: {agent.object_type || "Unknown"}</p>
                    <p>Active: {agent.is_active ? "Yes" : "No"}</p>
                    <p>
                      Location: {agent.latitude}, {agent.longitude}
                    </p>
                    <p>
                      Created: {new Date(agent.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded">
              <p className="text-yellow-400 text-xs">
                ⚠️ No agents found in database!
                <br />
                This is why you see mock data.
                <br />
                Deploy agents via AgentSphere first.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseDebugger;
