import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ncjbwzibnqrbrvicdmec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAgents() {
  try {
    console.log('✅ Querying deployed_objects table...\n');

    const { data, error } = await supabase
      .from('deployed_objects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log(`📊 Total Agents: ${data.length}\n`);
    console.log('='.repeat(140));
    
    data.forEach((agent, index) => {
      console.log(`\n${index + 1}. ${agent.name || agent.object_name || 'Unnamed'}`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   Type: ${agent.agent_type || agent.object_type || 'N/A'}`);
      console.log(`   Wallet: ${agent.wallet_address || 'Not deployed'}`);
      console.log(`   Location: ${agent.latitude}, ${agent.longitude}`);
      console.log(`   Status: ${agent.status || 'N/A'}`);
      console.log(`   Created: ${new Date(agent.created_at).toLocaleString()}`);
      console.log('-'.repeat(140));
    });

    // Group by agent type
    console.log('\n\n📈 AGENTS BY TYPE:');
    console.log('='.repeat(140));
    const byType = {};
    data.forEach(agent => {
      const type = agent.agent_type || agent.object_type || 'Unknown';
      if (!byType[type]) byType[type] = [];
      byType[type].push(agent);
    });

    Object.entries(byType).sort().forEach(([type, agents]) => {
      console.log(`\n${type}: ${agents.length} agent(s)`);
      agents.forEach(a => {
        const name = a.name || a.object_name || 'Unnamed';
        const wallet = a.wallet_address || 'No wallet';
        console.log(`  - ${name} → ${wallet}`);
      });
    });

    // Agents with wallet addresses
    console.log('\n\n💰 DEPLOYED AGENTS (with wallet addresses):');
    console.log('='.repeat(140));
    const deployed = data.filter(a => a.wallet_address);
    console.log(`Total deployed: ${deployed.length} out of ${data.length}\n`);
    
    if (deployed.length > 0) {
      deployed.forEach(agent => {
        const name = agent.name || agent.object_name || 'Unnamed';
        const type = agent.agent_type || agent.object_type || 'Unknown';
        console.log(`${name} (${type})`);
        console.log(`  → ${agent.wallet_address}`);
        console.log('');
      });
    } else {
      console.log('No agents with wallet addresses found.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

listAgents();
