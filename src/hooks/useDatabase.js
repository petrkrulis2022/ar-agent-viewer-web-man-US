import { useState, useEffect, useCallback, useRef } from "react";
import {
  supabase,
  getNearbyObjectsFromSupabase,
  getConnectionStatus,
  isSupabaseConfigured,
  debugSupabaseConfig,
} from "../lib/supabase.js";

// Mock data generator for fallback
const generateMockObjects = (location) => {
  const { latitude, longitude, radius_meters = 100, limit = 10 } = location;
  console.log("🎯 Generating enhanced mock objects at", latitude, longitude);

  // Create more diverse mock agents with better spatial distribution
  const agentTypes = [
    "Intelligent Assistant",
    "Content Creator",
    "Local Services",
    "Tutor/Teacher",
    "Game Agent",
  ];

  const agentNames = [
    ["AI Helper", "Smart Assistant", "Data Analyst", "Problem Solver"],
    ["Creative Assistant", "Content Writer", "Design Helper", "Story Creator"],
    ["Service Connector", "Local Guide", "Business Helper", "Community Link"],
    ["Learning Guide", "Study Buddy", "Skill Trainer", "Knowledge Helper"],
    ["Game Buddy", "Entertainment Bot", "Challenge Master", "Fun Companion"],
  ];

  const descriptions = [
    [
      "An intelligent AI assistant to help with analysis, research, and problem-solving",
      "Advanced AI that helps with data analysis and decision making",
      "Smart assistant for complex problem solving and research",
      "Intelligent helper for analytical tasks and insights",
    ],
    [
      "I help create engaging content, stories, and visual materials for your projects",
      "Creative writing and content generation specialist",
      "Design and visual content creation assistant",
      "Storytelling and narrative development expert",
    ],
    [
      "I connect you with trusted local service providers in your area",
      "Your guide to local businesses and services",
      "Helper for finding and connecting with local businesses",
      "Community connector for local services and events",
    ],
    [
      "I provide personalized tutoring and educational support on various subjects",
      "Learning companion for skill development and training",
      "Educational assistant for various academic subjects",
      "Personalized learning and knowledge acquisition helper",
    ],
    [
      "Interactive gaming companion for fun challenges and entertainment",
      "Entertainment and gaming assistant for fun activities",
      "Challenge creator and gaming companion",
      "Fun and interactive entertainment helper",
    ],
  ];

  const mockObjects = [];

  // Generate 12 agents with better spatial distribution
  for (let i = 0; i < 12; i++) {
    const typeIndex = i % agentTypes.length;
    const nameIndex =
      Math.floor(i / agentTypes.length) % agentNames[typeIndex].length;

    // Create circular distribution around user location
    const angle = (i / 12) * 2 * Math.PI; // Full circle distribution
    const distance = 20 + (i % 4) * 20; // Vary distance: 20m, 40m, 60m, 80m

    // Calculate lat/lng offset (roughly 1 degree = 111km)
    const latOffset = (Math.cos(angle) * distance) / 111000; // Convert meters to degrees
    const lngOffset =
      (Math.sin(angle) * distance) /
      (111000 * Math.cos((latitude * Math.PI) / 180));

    const agent = {
      id: `mock-${i + 1}`,
      user_id: "demo-user",
      object_type: "agent",
      agent_type: agentTypes[typeIndex],
      name: agentNames[typeIndex][nameIndex],
      description: descriptions[typeIndex][nameIndex],
      latitude: latitude + latOffset,
      longitude: longitude + lngOffset,
      altitude: 5 + (i % 3) * 5, // Vary altitude: 5m, 10m, 15m
      model_url: `https://threejs.org/examples/models/gltf/Duck/glTF/Duck.gltf`,
      model_type: "gltf",
      scale_x: 0.8 + (i % 3) * 0.4, // Vary scale: 0.8, 1.2, 1.6
      scale_y: 0.8 + (i % 3) * 0.4,
      scale_z: 0.8 + (i % 3) * 0.4,
      rotation_x: 0.0,
      rotation_y: (i * 30) % 360, // Vary rotation
      rotation_z: 0.0,
      is_active: true,
      visibility_radius: 50 + (i % 5) * 25, // Vary visibility: 50m to 150m
      created_at: new Date(Date.now() - i * 60000).toISOString(), // Stagger creation times
      updated_at: new Date().toISOString(),
      distance_meters: distance,
    };

    mockObjects.push(agent);
  }

  console.log(
    `✅ Generated ${mockObjects.length} enhanced mock agent objects with circular distribution`
  );
  console.log(
    "📊 Agent distribution:",
    mockObjects.map((a) => ({
      name: a.name,
      type: a.agent_type,
      distance: `${a.distance_meters}m`,
      position: `(${a.latitude.toFixed(6)}, ${a.longitude.toFixed(6)})`,
    }))
  );

  return mockObjects
    .filter((obj) => (obj.distance_meters || 0) <= radius_meters)
    .slice(0, limit);
};

const findMockObjectById = (id) => {
  return (
    generateMockObjects({
      latitude: 37.7749,
      longitude: -122.4194,
      radius_meters: 1000,
    }).find((obj) => obj.id === id) || null
  );
};

export const useDatabase = () => {
  const [state, setState] = useState({
    isLoading: false,
    error: null,
    lastSync: null,
    connectionStatus: "unknown",
  });

  const isMountedRef = useRef(true);

  // Get nearby objects with fallback to mock data
  const getNearbyObjects = useCallback(async (location) => {
    try {
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
      }

      console.log("🔍 Fetching nearby objects for location:", location);

      // Try to get data from Supabase first
      const supabaseData = await getNearbyObjectsFromSupabase(
        location.latitude,
        location.longitude,
        location.radius_meters || 100
      );

      let objects;

      if (supabaseData && supabaseData.length > 0) {
        // Process Supabase data
        objects = supabaseData.map((obj) => ({
          id: obj.id,
          user_id: obj.user_id || "unknown",
          object_type: obj.object_type || "agent",
          agent_type:
            obj.agent_type || obj.object_type || "Intelligent Assistant",
          name: obj.name || "Unnamed Agent",
          description: obj.description || "No description available",
          latitude: parseFloat(obj.latitude || 0),
          longitude: parseFloat(obj.longitude || 0),
          altitude: parseFloat(obj.altitude || 0),
          model_url:
            obj.model_url ||
            "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf",
          model_type: obj.model_type || "gltf",
          scale_x: parseFloat(obj.scale_x || 1),
          scale_y: parseFloat(obj.scale_y || 1),
          scale_z: parseFloat(obj.scale_z || 1),
          rotation_x: parseFloat(obj.rotation_x || 0),
          rotation_y: parseFloat(obj.rotation_y || 0),
          rotation_z: parseFloat(obj.rotation_z || 0),
          is_active: obj.is_active !== false,
          visibility_radius: parseInt(obj.visibility_radius || 100),
          created_at: obj.created_at || new Date().toISOString(),
          updated_at: obj.created_at || new Date().toISOString(),
          distance_meters:
            typeof obj.distance_meters === "number"
              ? obj.distance_meters
              : typeof obj.distance_meters === "string"
              ? parseFloat(obj.distance_meters)
              : 0,
          preciselatitude: obj.preciselatitude
            ? parseFloat(obj.preciselatitude)
            : undefined,
          preciselongitude: obj.preciselongitude
            ? parseFloat(obj.preciselongitude)
            : undefined,
          precisealtitude: obj.precisealtitude
            ? parseFloat(obj.precisealtitude)
            : undefined,
          accuracy: obj.accuracy ? parseFloat(obj.accuracy) : undefined,
          correctionapplied: obj.correctionapplied || false,
        }));

        console.log(
          `✅ Loaded ${objects.length} objects from Supabase:`,
          objects
        );
      } else if (supabaseData === null && isSupabaseConfigured) {
        console.warn(
          "⚠️ Supabase returned null data but is configured - check your connection"
        );
        objects = generateMockObjects(location);
        console.log(
          `🔄 Using ${objects.length} mock objects due to Supabase data issue`
        );
        if (objects.length > 0) {
          console.log("Sample object:", objects[0]);
        }
      } else {
        objects = generateMockObjects(location);
        console.log(
          `⚠️ Using ${objects.length} mock objects (Supabase not available or not configured)`
        );
      }

      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          lastSync: Date.now(),
        }));
      }

      return objects;
    } catch (error) {
      const errorInfo = {
        code: "QUERY_ERROR",
        message: error.message || "Failed to fetch nearby objects",
        details: error,
      };

      console.error("Database query error:", errorInfo);

      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, isLoading: false, error: errorInfo }));
      }

      const fallbackObjects = generateMockObjects(location);
      console.log(
        `🔄 Returning ${fallbackObjects.length} fallback mock objects due to error`
      );
      return fallbackObjects;
    }
  }, []);

  // Get object by ID
  const getObjectById = useCallback(
    async (id) => {
      try {
        if (isMountedRef.current) {
          setState((prev) => ({ ...prev, isLoading: true, error: null }));
        }

        const objects = await getNearbyObjects(id);

        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            lastSync: Date.now(),
          }));
        }

        return objects;
      } catch (error) {
        const errorInfo = {
          code: "QUERY_ERROR",
          message: error.message || "Failed to fetch object",
          details: error,
        };

        if (isMountedRef.current) {
          setState((prev) => ({ ...prev, isLoading: false, error: errorInfo }));
        }

        return null;
      }
    },
    [getNearbyObjects]
  );

  // Refresh connection
  const refreshConnection = useCallback(async () => {
    try {
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error: null }));
      }

      console.log("🔄 Refreshing database connection...");
      debugSupabaseConfig();

      const status = await getConnectionStatus();

      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          connectionStatus: status.connected ? "connected" : "disconnected",
          error: status.connected ? null : { message: status.error },
        }));
      }

      if (status.connected) {
        console.log("✅ Database connection refreshed successfully");
      } else {
        console.warn("⚠️ Database connection failed:", status.error);
      }

      return status.connected;
    } catch (error) {
      console.error("❌ Error refreshing connection:", error);

      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          connectionStatus: "disconnected",
          error: { message: error.message || "Connection refresh failed" },
        }));
      }

      return false;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    if (isMountedRef.current) {
      setState((prev) => ({ ...prev, error: null }));
    }
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    isMountedRef.current = true;
    refreshConnection();

    return () => {
      isMountedRef.current = false;
    };
  }, [refreshConnection]);

  return {
    ...state,
    getNearbyObjects,
    getObjectById,
    refreshConnection,
    clearError,
  };
};
