import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using environment variables for web
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ncjbwzibnqrbrvicdmec.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI';

// Check if we have valid Supabase credentials
const hasValidCredentials = SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL !== 'your_supabase_project_url_here' &&
  SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here' &&
  SUPABASE_URL.startsWith('https://');

// Create Supabase client
export const supabase = hasValidCredentials ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
}) : null;

// Test connection function
export const testConnection = async () => {
  try {
    if (!hasValidCredentials) {
      console.warn('⚠️ Supabase environment variables not set or invalid, using demo mode');
      return false;
    }

    if (!supabase) {
      console.warn('⚠️ Supabase client not initialized');
      return false;
    }

    console.log('🔗 Testing Supabase connection...');

    // Test actual connection to Supabase with minimal query
    const { data, error } = await supabase
      .from('deployed_objects')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }

    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return false;
  }
};

// Get nearby objects from Supabase
export const getNearbyObjectsFromSupabase = async (latitude, longitude, radius = 100) => {
  try {
    if (!hasValidCredentials || !supabase) {
      console.warn('⚠️ No valid Supabase credentials, returning null');
      return null;
    }

    console.log(`🔍 Querying Supabase for objects near ${latitude.toFixed(6)}, ${longitude.toFixed(6)} within ${radius}m`);

    const { data, error } = await supabase
      .from('deployed_objects')
      .select(`
        id,
        name,
        description,
        latitude,
        longitude,
        altitude,
        object_type,
        user_id,
        created_at,
        is_active
      `)
      .eq('is_active', true)
      .limit(100);

    if (error) {
      console.error('❌ Error fetching objects from Supabase:', error);
      return null;
    }

    // Calculate distances manually and filter by radius
    const objectsWithDistance = data?.map(obj => {
      const distance = calculateDistance(
        latitude, longitude,
        obj.latitude, obj.longitude
      );
      return {
        ...obj,
        model_url: 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
        model_type: obj.object_type || 'sphere',
        scale_x: 1.0,
        scale_y: 1.0,
        scale_z: 1.0,
        rotation_x: 0.0,
        rotation_y: 0.0,
        rotation_z: 0.0,
        visibility_radius: 50.0,
        updated_at: obj.created_at,
        distance_meters: distance * 1000 // Convert km to meters
      };
    }).filter(obj => (obj.distance_meters || 0) <= radius)
      .sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0)) || [];

    console.log(`✅ Found ${objectsWithDistance.length} objects using direct query`);
    return objectsWithDistance;

  } catch (error) {
    console.error('❌ Error in getNearbyObjectsFromSupabase:', error);
    return null;
  }
};

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Health check function
export const getConnectionStatus = async () => {
  const startTime = Date.now();
  
  try {
    if (!hasValidCredentials) {
      return {
        connected: false,
        error: 'Supabase environment variables not configured or invalid',
      };
    }

    if (!supabase) {
      return {
        connected: false,
        error: 'Supabase client not initialized',
      };
    }

    const { error } = await supabase
      .from('deployed_objects')
      .select('id')
      .limit(1);
    
    const latency = Date.now() - startTime;
    
    if (error) {
      return {
        connected: false,
        error: error.message,
      };
    }

    return {
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message || 'Connection failed',
    };
  }
};

// Export connection status for components to check
export const isSupabaseConfigured = hasValidCredentials;

// Debug function to check current configuration
export const debugSupabaseConfig = () => {
  console.log('🔧 Supabase Configuration Debug:');
  console.log('- Environment type: Browser (React Web App)');
  console.log('- VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('- Final SUPABASE_URL:', SUPABASE_URL);
  console.log('- URL configured:', !!SUPABASE_URL);
  console.log('- Key configured:', !!SUPABASE_ANON_KEY);
  console.log('- Valid credentials:', hasValidCredentials);
  console.log('- Client initialized:', !!supabase);
  
  if (hasValidCredentials) {
    console.log('- URL:', SUPABASE_URL);
    console.log('- Key length:', SUPABASE_ANON_KEY.length);
  }
};

