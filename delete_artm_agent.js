require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function deleteARTM() {
  try {
    console.log('🗑️  Deleting ARTM agent...\n');
    
    const { data, error } = await supabase
      .from('deployed_objects')
      .delete()
      .eq('name', 'ARTM 1');
    
    if (error) throw error;
    
    console.log('✅ ARTM 1 deleted successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

deleteARTM();
