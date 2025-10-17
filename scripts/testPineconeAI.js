import dotenv from 'dotenv';
import enhancedAI from '../services/enhancedAI.js';
import pineconeDataSync from '../services/pineconeDataSync.js';

dotenv.config();

/**
 * Test script for Pinecone AI integration
 * Tests query analysis, data retrieval, and AI responses
 */

async function testPineconeAI() {
  console.log('🧪 Testing Pinecone AI Integration\n');
  console.log('='.repeat(60));

  // Test 1: Query Analysis
  console.log('\n📋 Test 1: Query Analysis');
  console.log('-'.repeat(60));
  
  const testQueries = [
    "What are today's orders?",
    "Show me this month's revenue",
    "What was last month's profit?",
    "Compare this week vs last week",
    "How's my ROAS?",
  ];

  for (const query of testQueries) {
    const analysis = enhancedAI.analyzeQuery(query);
    console.log(`\nQuery: "${query}"`);
    console.log(`  Time Period: ${analysis.timePeriod}`);
    console.log(`  Metrics: ${analysis.metrics.join(', ')}`);
    if (analysis.specificDate) {
      console.log(`  Specific Date: ${analysis.specificDate}`);
    }
  }

  // Test 2: Pinecone Connection
  console.log('\n\n📋 Test 2: Pinecone Connection');
  console.log('-'.repeat(60));
  
  try {
    await pineconeDataSync.initialize();
    console.log('✅ Pinecone connection successful');
  } catch (error) {
    console.error('❌ Pinecone connection failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. PINECONE_API_KEY is set in .env');
    console.log('   2. You ran: npm run pinecone:init');
    return;
  }

  // Test 3: Data Storage
  console.log('\n\n📋 Test 3: Data Storage');
  console.log('-'.repeat(60));
  
  const testUserId = 'test-user-123';
  const testData = {
    dailyData: [],
    summary: {
      period: 'Test Period',
      totalRevenue: 100000,
      totalOrders: 50,
      totalGrossProfit: 60000,
      totalNetProfit: 40000,
      totalCOGS: 40000,
      totalAdSpend: 15000,
      avgOrderValue: 2000,
      totalROAS: 6.67,
      grossMargin: 60,
      netMargin: 40,
    },
  };

  try {
    const result = await pineconeDataSync.storeDailyData(
      testUserId,
      testData.dailyData,
      testData.summary
    );
    
    if (result.success) {
      console.log(`✅ Data stored successfully (${result.count} records)`);
    } else {
      console.error('❌ Data storage failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Data storage error:', error.message);
  }

  // Test 4: Data Retrieval
  console.log('\n\n📋 Test 4: Data Retrieval');
  console.log('-'.repeat(60));
  
  try {
    const results = await pineconeDataSync.queryData(
      testUserId,
      'revenue and orders',
      5
    );
    
    console.log(`✅ Retrieved ${results.length} data points`);
    
    if (results.length > 0) {
      console.log('\nSample result:');
      console.log(`  Score: ${results[0].score.toFixed(4)}`);
      console.log(`  Content: ${results[0].content.substring(0, 100)}...`);
    }
  } catch (error) {
    console.error('❌ Data retrieval error:', error.message);
  }

  // Test 5: AI Response Generation
  console.log('\n\n📋 Test 5: AI Response Generation');
  console.log('-'.repeat(60));
  
  const businessData = {
    revenue: 478863,
    orders: 2918,
    grossProfit: 287318,
    netProfit: 177318,
    cogs: 191545,
    adSpend: 62000,
    roas: 7.72,
    aov: 1641,
  };

  const aiTestQueries = [
    "What are today's orders?",
    "Show me this month's revenue",
    "What's my profit margin?",
  ];

  for (const query of aiTestQueries) {
    console.log(`\n💬 Query: "${query}"`);
    
    try {
      const result = await enhancedAI.generateResponse(
        testUserId,
        query,
        businessData
      );
      
      if (result.success) {
        console.log(`✅ Response: ${result.answer}`);
        console.log(`   Data points used: ${result.dataPoints}`);
      } else {
        console.error(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  // Test Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log('\n✅ All tests completed!');
  console.log('\n💡 Next steps:');
  console.log('   1. If all tests passed, your system is ready!');
  console.log('   2. Run: npm run pinecone:sync (to sync real data)');
  console.log('   3. Add routes to your server (see PINECONE_QUICKSTART.md)');
  console.log('   4. Test with your frontend');
  console.log('\n🚀 Your AI can now answer ANY question!\n');
}

// Run tests
testPineconeAI().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
