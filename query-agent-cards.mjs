import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ncjbwzibnqrbrvicdmec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryAgentCards() {
  try {
    console.log('✅ Querying agent_cards table...\n');

    // First check if table exists
    const { data, error } = await supabase
      .from('agent_cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error.message);
      
      // Try alternative table names
      console.log('\n🔍 Trying alternative table names...\n');
      
      const tables = ['agent_card', 'cards', 'virtual_cards', 'payment_cards'];
      for (const table of tables) {
        console.log(`Checking table: ${table}...`);
        const { data: altData, error: altError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!altError) {
          console.log(`✅ Found table: ${table}`);
          const { data: fullData } = await supabase
            .from(table)
            .select('*')
            .order('created_at', { ascending: false });
          
          displayCards(fullData, table);
          return;
        }
      }
      
      console.log('\n❌ No agent cards table found.');
      console.log('Available tables might be different. Check Supabase dashboard.');
      return;
    }

    displayCards(data, 'agent_cards');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

function displayCards(data, tableName) {
  console.log(`\n📊 Total Agent Cards in '${tableName}': ${data.length}\n`);
  console.log('='.repeat(140));

  if (data.length === 0) {
    console.log('No agent cards found.');
    return;
  }

  data.forEach((card, index) => {
    console.log(`\n${index + 1}. Card Details:`);
    console.log(`   ID: ${card.id || 'N/A'}`);
    console.log(`   Wallet Address: ${card.wallet_address || 'N/A'}`);
    console.log(`   Card Number: ${card.card_number || card.number || 'N/A'}`);
    console.log(`   Card Name: ${card.card_name || card.name || 'N/A'}`);
    console.log(`   Balance: ${card.balance || 'N/A'}`);
    console.log(`   Currency: ${card.currency || 'N/A'}`);
    console.log(`   Status: ${card.status || 'N/A'}`);
    console.log(`   Created: ${card.created_at ? new Date(card.created_at).toLocaleString() : 'N/A'}`);
    
    // Show all fields
    console.log(`\n   All Fields:`);
    Object.entries(card).forEach(([key, value]) => {
      if (!['id', 'wallet_address', 'card_number', 'number', 'card_name', 'name', 'balance', 'currency', 'status', 'created_at'].includes(key)) {
        console.log(`   ${key}: ${JSON.stringify(value)}`);
      }
    });
    console.log('-'.repeat(140));
  });

  // Group by wallet address
  console.log('\n\n💳 CARDS GROUPED BY WALLET:\n');
  console.log('='.repeat(140));
  
  const byWallet = {};
  data.forEach(card => {
    const wallet = card.wallet_address || 'No wallet';
    if (!byWallet[wallet]) {
      byWallet[wallet] = [];
    }
    byWallet[wallet].push(card);
  });

  Object.entries(byWallet).sort((a, b) => b[1].length - a[1].length).forEach(([wallet, cards]) => {
    console.log(`\n${wallet}: ${cards.length} card(s)`);
    cards.forEach(c => {
      const name = c.card_name || c.name || 'Unnamed';
      const number = c.card_number || c.number || 'N/A';
      const balance = c.balance || '0';
      console.log(`  → ${name} (${number}) - Balance: ${balance}`);
    });
  });
}

queryAgentCards();
