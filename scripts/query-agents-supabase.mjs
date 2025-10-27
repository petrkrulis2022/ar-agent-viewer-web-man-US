import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ncjbwzibnqrbrvicdmec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110';

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryAgents() {
  try {
    console.log('✅ Querying Supabase database...\n');

    const { data, error } = await supabase
      .from('near_objects')
      .select('id, name, agent_type, wallet_address, latitude, longitude, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log(`📊 Total Agents: ${data.length}\n`);
    console.log('='.repeat(120));
    
    data.forEach((agent, index) => {
      console.log(`\n${index + 1}. ${agent.name || 'Unnamed'}`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   Type: ${agent.agent_type || 'N/A'}`);
      console.log(`   Wallet: ${agent.wallet_address || 'Not deployed'}`);
      console.log(`   Location: ${agent.latitude}, ${agent.longitude}`);
      console.log(`   Status: ${agent.status || 'N/A'}`);
      console.log(`   Created: ${agent.created_at}`);
      console.log('-'.repeat(120));
    });

    // Group by agent type
    console.log('\n\n📈 AGENTS BY TYPE:');
    console.log('='.repeat(120));
    const byType = {};
    data.forEach(agent => {
      const type = agent.agent_type || 'Unknown';
      if (!byType[type]) byType[type] = [];
      byType[type].push(agent);
    });

    Object.entries(byType).forEach(([type, agents]) => {
      console.log(`\n${type}: ${agents.length} agents`);
      agents.forEach(a => {
        console.log(`  - ${a.name} (${a.wallet_address || 'No wallet'})`);
      });
    });

    // Agents with wallet addresses
    console.log('\n\n💰 DEPLOYED AGENTS (with wallet addresses):');
    console.log('='.repeat(120));
    const deployed = data.filter(a => a.wallet_address);
    console.log(`Total deployed: ${deployed.length}\n`);
    deployed.forEach(agent => {
      console.log(`${agent.name} (${agent.agent_type})`);
      console.log(`  → ${agent.wallet_address}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

queryAgents();
