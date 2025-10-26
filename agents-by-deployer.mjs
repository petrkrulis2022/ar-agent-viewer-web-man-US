import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ncjbwzibnqrbrvicdmec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAgentsByDeployer() {
  try {
    console.log('✅ Querying agents by deployer wallet address...\n');

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

    // Group by deployer wallet address
    const byDeployer = {};
    data.forEach(agent => {
      const wallet = agent.wallet_address || 'No wallet address';
      if (!byDeployer[wallet]) {
        byDeployer[wallet] = [];
      }
      byDeployer[wallet].push(agent);
    });

    // Sort by number of agents (most to least)
    const sortedDeployers = Object.entries(byDeployer).sort((a, b) => b[1].length - a[1].length);

    console.log('\n💰 AGENTS GROUPED BY DEPLOYER WALLET:\n');
    console.log('='.repeat(140));

    sortedDeployers.forEach(([wallet, agents], index) => {
      console.log(`\n${index + 1}. Deployer Wallet: ${wallet}`);
      console.log(`   Total Agents: ${agents.length}`);
      console.log('-'.repeat(140));
      
      agents.forEach((agent, agentIndex) => {
        const name = agent.name || agent.object_name || 'Unnamed';
        const type = agent.agent_type || agent.object_type || 'Unknown';
        console.log(`   ${agentIndex + 1}. ${name}`);
        console.log(`      Type: ${type}`);
        console.log(`      ID: ${agent.id}`);
        console.log(`      Location: ${agent.latitude}, ${agent.longitude}`);
        console.log(`      Status: ${agent.status || 'N/A'}`);
        console.log(`      Created: ${new Date(agent.created_at).toLocaleString()}`);
        console.log('');
      });
      console.log('-'.repeat(140));
    });

    // Summary
    console.log('\n\n📈 SUMMARY BY DEPLOYER:\n');
    console.log('='.repeat(140));
    sortedDeployers.forEach(([wallet, agents]) => {
      if (wallet !== 'No wallet address') {
        console.log(`${wallet}: ${agents.length} agent(s)`);
        agents.forEach(a => {
          const name = a.name || a.object_name || 'Unnamed';
          const type = a.agent_type || a.object_type || 'Unknown';
          console.log(`  → ${name} (${type})`);
        });
        console.log('');
      }
    });

    // Agents without wallet
    const noWallet = byDeployer['No wallet address'];
    if (noWallet && noWallet.length > 0) {
      console.log('\n⚠️  AGENTS WITHOUT WALLET ADDRESS:\n');
      console.log('='.repeat(140));
      console.log(`Total: ${noWallet.length} agent(s)\n`);
      noWallet.forEach(a => {
        const name = a.name || a.object_name || 'Unnamed';
        const type = a.agent_type || a.object_type || 'Unknown';
        console.log(`  → ${name} (${type})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

listAgentsByDeployer();
