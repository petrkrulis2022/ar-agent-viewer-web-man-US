import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  supabase, 
  getNearbyObjectsFromSupabase, 
  getConnectionStatus, 
  isSupabaseConfigured,
  debugSupabaseConfig 
} from '../lib/supabase.js';

// Mock data generator for fallback
const generateMockObjects = (location) => {
  const { latitude, longitude, radius_meters = 100, limit = 10 } = location;
  console.log('Generating mock objects at', latitude, longitude);

  const mockObjects = [
    {
      id: 'mock-1',
      user_id: 'demo-user',
      object_type: 'agent',
      agent_type: 'Intelligent Assistant',
      name: 'AI Helper',
      description: 'An intelligent AI assistant to help with analysis, research, and problem-solving',
      latitude: latitude + 0.0001,
      longitude: longitude + 0.0001,
      altitude: 10,
      model_url: 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
      model_type: 'gltf',
      scale_x: 1.0,
      scale_y: 1.0,
      scale_z: 1.0,
      rotation_x: 0.0,
      rotation_y: 0.0,
      rotation_z: 0.0,
      is_active: true,
      visibility_radius: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      distance_meters: 15.2,
    },
    {
      id: 'mock-2',
      user_id: 'demo-user',
      object_type: 'agent',
      agent_type: 'Content Creator',
      name: 'Creative Assistant',
      description: 'I help create engaging content, stories, and visual materials for your projects',
      latitude: latitude - 0.0001,
      longitude: longitude + 0.0002,
      altitude: 15,
      model_url: 'https://threejs.org/examples/models/gltf/Suzanne/glTF/Suzanne.gltf',
      model_type: 'gltf',
      scale_x: 0.5,
      scale_y: 0.5,
      scale_z: 0.5,
      rotation_x: 0.0,
      rotation_y: 45.0,
      rotation_z: 0.0,
      is_active: true,
      visibility_radius: 75,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      distance_meters: 28.7,
    },
    {
      id: 'mock-3',
      user_id: 'demo-user',
      object_type: 'agent',
      agent_type: 'Local Services',
      name: 'Service Connector',
      description: 'I connect you with trusted local service providers in your area',
      latitude: latitude + 0.0002,
      longitude: longitude - 0.0001,
      altitude: 5,
      model_url: 'https://threejs.org/examples/models/gltf/Duck/glTF/Duck.gltf',
      model_type: 'gltf',
      scale_x: 2.0,
      scale_y: 2.0,
      scale_z: 2.0,
      rotation_x: 0.0,
      rotation_y: 0.0,
      rotation_z: 0.0,
      is_active: true,
      visibility_radius: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      distance_meters: 42.1,
    },
    {
      id: 'mock-4',
      user_id: 'demo-user',
      object_type: 'agent',
      agent_type: 'Tutor/Teacher',
      name: 'Learning Guide',
      description: 'I provide personalized tutoring and educational support on various subjects',
      latitude: latitude + 0.0003,
      longitude: longitude - 0.0002,
      altitude: 8,
      model_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf',
      model_type: 'gltf',
      scale_x: 1.5,
      scale_y: 1.5,
      scale_z: 1.5,
      rotation_x: 0.0,
      rotation_y: 45.0,
      rotation_z: 0.0,
      is_active: true,
      visibility_radius: 80,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      distance_meters: 35.8,
    },
    {
      id: 'mock-5',
      user_id: 'demo-user',
      object_type: 'agent',
      agent_type: 'Game Agent',
      name: 'Game Buddy',
      description: 'Interactive gaming companion for fun challenges and entertainment',
      latitude: latitude - 0.0002,
      longitude: longitude - 0.0001,
      altitude: 12,
      model_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF/Box.gltf',
      model_type: 'gltf',
      scale_x: 1.2,
      scale_y: 1.2,
      scale_z: 1.2,
      rotation_x: 0.0,
      rotation_y: 30.0,
      rotation_z: 0.0,
      is_active: true,
      visibility_radius: 60,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      distance_meters: 22.3,
    },
  ];

  console.log(`Generated ${mockObjects.length} mock agent objects`);
  return mockObjects
    .filter(obj => (obj.distance_meters || 0) <= radius_meters)
    .slice(0, limit);
};

const findMockObjectById = (id) => {
  return generateMockObjects({ latitude: 37.7749, longitude: -122.4194, radius_meters: 1000 })
    .find(obj => obj.id === id) || null;
};

export const useDatabase = () => {
  const [state, setState] = useState({
    isLoading: false,
    error: null,
    lastSync: null,
    connectionStatus: 'unknown',
  });

  const isMountedRef = useRef(true);

  // Get nearby objects with fallback to mock data
  const getNearbyObjects = useCallback(async (location) => {
    try {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
      }

      console.log('🔍 Fetching nearby objects for location:', location);

      // Try to get data from Supabase first
      const supabaseData = await getNearbyObjectsFromSupabase(
        location.latitude,
        location.longitude,
        location.radius_meters || 100
      );

      let objects;

      if (supabaseData && supabaseData.length > 0) {
        // Process Supabase data
        objects = supabaseData.map(obj => ({
          id: obj.id,
          user_id: obj.user_id || 'unknown',
          object_type: obj.object_type || 'agent',
          agent_type: obj.agent_type || obj.object_type || 'Intelligent Assistant',
          name: obj.name || 'Unnamed Agent',
          description: obj.description || 'No description available',
          latitude: parseFloat(obj.latitude || 0),
          longitude: parseFloat(obj.longitude || 0),
          altitude: parseFloat(obj.altitude || 0),
          model_url: obj.model_url || 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
          model_type: obj.model_type || 'gltf',
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
          distance_meters: typeof obj.distance_meters === 'number' ? obj.distance_meters : 
                          typeof obj.distance_meters === 'string' ? parseFloat(obj.distance_meters) : 0,
          preciselatitude: obj.preciselatitude ? parseFloat(obj.preciselatitude) : undefined,
          preciselongitude: obj.preciselongitude ? parseFloat(obj.preciselongitude) : undefined,
          precisealtitude: obj.precisealtitude ? parseFloat(obj.precisealtitude) : undefined,
          accuracy: obj.accuracy ? parseFloat(obj.accuracy) : undefined,
          correctionapplied: obj.correctionapplied || false,
        }));

        console.log(`✅ Loaded ${objects.length} objects from Supabase:`, objects);
      } else if (supabaseData === null && isSupabaseConfigured) {
        console.warn('⚠️ Supabase returned null data but is configured - check your connection');
        objects = generateMockObjects(location);
        console.log(`🔄 Using ${objects.length} mock objects due to Supabase data issue`);
        if (objects.length > 0) {
          console.log('Sample object:', objects[0]);
        }
      } else {
        objects = generateMockObjects(location);
        console.log(`⚠️ Using ${objects.length} mock objects (Supabase not available or not configured)`);
      }

      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false, lastSync: Date.now() }));
      }

      return objects;
    } catch (error) {
      const errorInfo = {
        code: 'QUERY_ERROR',
        message: error.message || 'Failed to fetch nearby objects',
        details: error,
      };

      console.error('Database query error:', errorInfo);

      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false, error: errorInfo }));
      }

      const fallbackObjects = generateMockObjects(location);
      console.log(`🔄 Returning ${fallbackObjects.length} fallback mock objects due to error`);
      return fallbackObjects;
    }
  }, []);

  // Get object by ID
  const getObjectById = useCallback(async (id) => {
    try {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
      }

      const objects = await getNearbyObjects(id);

      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false, lastSync: Date.now() }));
      }

      return objects;
    } catch (error) {
      const errorInfo = {
        code: 'QUERY_ERROR',
        message: error.message || 'Failed to fetch object',
        details: error,
      };

      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false, error: errorInfo }));
      }

      return null;
    }
  }, [getNearbyObjects]);

  // Refresh connection
  const refreshConnection = useCallback(async () => {
    try {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, error: null }));
      }

      console.log('🔄 Refreshing database connection...');
      debugSupabaseConfig();

      const status = await getConnectionStatus();
      
      if (isMountedRef.current) {
        setState(prev => ({ 
          ...prev, 
          connectionStatus: status.connected ? 'connected' : 'disconnected',
          error: status.connected ? null : { message: status.error }
        }));
      }

      if (status.connected) {
        console.log('✅ Database connection refreshed successfully');
      } else {
        console.warn('⚠️ Database connection failed:', status.error);
      }

      return status.connected;
    } catch (error) {
      console.error('❌ Error refreshing connection:', error);
      
      if (isMountedRef.current) {
        setState(prev => ({ 
          ...prev, 
          connectionStatus: 'disconnected',
          error: { message: error.message || 'Connection refresh failed' }
        }));
      }
      
      return false;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, error: null }));
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

