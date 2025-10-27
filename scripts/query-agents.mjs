import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_OqGdEVeMiHi3@ep-autumn-union-a25l0uh2.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function queryAgents() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const result = await client.query(`
      SELECT 
        id,
        name,
        agent_type,
        wallet_address,
        latitude,
        longitude,
        status,
        created_at
      FROM near_objects
      ORDER BY created_at DESC
    `);

    console.log(`📊 Total Agents: ${result.rows.length}\n`);
    console.log('='.repeat(120));
    
    result.rows.forEach((agent, index) => {
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
    result.rows.forEach(agent => {
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
    const deployed = result.rows.filter(a => a.wallet_address);
    console.log(`Total deployed: ${deployed.length}\n`);
    deployed.forEach(agent => {
      console.log(`${agent.name} (${agent.agent_type})`);
      console.log(`  → ${agent.wallet_address}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

queryAgents();
