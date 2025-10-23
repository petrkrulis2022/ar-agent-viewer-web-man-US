import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ncjbwzibnqrbrvicdmec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryAllAgents() {
  try {
    console.log('🔍 Querying ALL agent wallet address fields...\n');

    const { data, error } = await supabase
      .from('deployed_objects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database Error:', error.message);
      return;
    }

    console.log(`📊 Total Agents: ${data.length}\n`);
    console.log('='.repeat(150));

    // Show all wallet-related fields for each agent
    data.forEach((agent, index) => {
      const name = agent.name || agent.object_name || 'Unnamed';
      const type = agent.agent_type || agent.object_type || 'Unknown';
      
      console.log(`\n${index + 1}. ${name} (${type})`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   Network: ${agent.network || agent.chain || 'N/A'} (Chain ID: ${agent.network_id || agent.chain_id || 'N/A'})`);
      console.log(`\n   💰 WALLET ADDRESSES:`);
      console.log(`      wallet_address: ${agent.wallet_address || '❌ NOT SET'}`);
      console.log(`      agent_wallet_address: ${agent.agent_wallet_address || '❌ NOT SET'}`);
      console.log(`      deployer_wallet_address: ${agent.deployer_wallet_address || '❌ NOT SET'}`);
      console.log(`      owner_wallet: ${agent.owner_wallet || '❌ NOT SET'}`);
      console.log(`      created_by: ${agent.created_by || '❌ NOT SET'}`);
      
      console.log(`\n   📍 Location: ${agent.latitude}, ${agent.longitude}`);
      console.log(`   📅 Created: ${new Date(agent.created_at).toLocaleString()}`);
      console.log('-'.repeat(150));
    });

    // Summary by wallet fields
    console.log('\n\n📈 WALLET FIELD SUMMARY:\n');
    console.log('='.repeat(150));
    
    const withWalletAddress = data.filter(a => a.wallet_address);
    const withAgentWallet = data.filter(a => a.agent_wallet_address);
    const withDeployerWallet = data.filter(a => a.deployer_wallet_address);
    const withOwnerWallet = data.filter(a => a.owner_wallet);
    const withCreatedBy = data.filter(a => a.created_by);

    console.log(`wallet_address: ${withWalletAddress.length}/${data.length} agents`);
    console.log(`agent_wallet_address: ${withAgentWallet.length}/${data.length} agents`);
    console.log(`deployer_wallet_address: ${withDeployerWallet.length}/${data.length} agents`);
    console.log(`owner_wallet: ${withOwnerWallet.length}/${data.length} agents`);
    console.log(`created_by: ${withCreatedBy.length}/${data.length} agents`);

    // Show unique wallet addresses
    if (withAgentWallet.length > 0) {
      console.log('\n\n💳 AGENTS WITH agent_wallet_address:\n');
      console.log('='.repeat(150));
      withAgentWallet.forEach(a => {
        const name = a.name || a.object_name || 'Unnamed';
        console.log(`${name}: ${a.agent_wallet_address}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

queryAllAgents();
