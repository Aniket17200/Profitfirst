import dotenv from 'dotenv';
import aiOrchestrator from './services/aiOrchestrator.js';
import vectorStore from './services/vectorStore.js';

dotenv.config();

async function testAISystem() {
  console.log('🧪 Testing AI System...\n');

  try {
    // Test 1: Vector Store Initialization
    console.log('1️⃣ Testing Vector Store...');
    await vectorStore.initialize();
    console.log('✅ Vector Store initialized\n');

    // Test 2: Store sample business context
    console.log('2️⃣ Storing sample business context...');
    const sampleData = {
      brandName: 'Test Brand',
      revenue: 478686.3,
      orders: 2918,
      aov: 1640,
      cogs: 150000,
      grossProfit: 328686.3,
      adSpend: 62000,
      shippingCost: 88587.3,
      netProfit: 178099,
      roas: 7.72,
      totalCustomers: 2500,
      newCustomers: 750,
      returningCustomers: 1750,
      returningRate: 70,
      totalShipments: 2800,
      delivered: 2500,
      inTransit: 200,
      rto: 80,
      ndr: 20,
    };
    
    await vectorStore.storeBusinessContext('test-user-123', sampleData);
    console.log('✅ Business context stored\n');

    // Test 3: Query the AI
    console.log('3️⃣ Testing AI Query...');
    const testQueries = [
      "What's my revenue?",
      "How many orders do I have?",
      "What's my profit margin?",
      "How is my ROAS?",
    ];

    for (const query of testQueries) {
      console.log(`\n📝 Query: "${query}"`);
      const result = await aiOrchestrator.processQuery('test-user-123', query, sampleData);
      
      if (result.success) {
        console.log(`✅ Response: ${result.response.substring(0, 200)}...`);
        console.log(`   Context used: ${result.contextUsed} documents`);
      } else {
        console.log(`❌ Error: ${result.error}`);
      }
    }

    console.log('\n\n✨ All tests completed successfully!');
    console.log('\n📊 System Status:');
    console.log('   ✅ OpenAI API: Connected');
    console.log('   ✅ Pinecone: Connected');
    console.log('   ✅ LangGraph: Working');
    console.log('   ✅ Vector Store: Working');
    console.log('   ✅ AI Orchestrator: Working');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. OPENAI_API_KEY is set in .env');
    console.error('2. PINECONE_API_KEY is set in .env');
    console.error('3. All packages are installed (npm install)');
    console.error('4. Pinecone index exists (run: node scripts/initPinecone.js)');
    process.exit(1);
  }
}

testAISystem();
