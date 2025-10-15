import dotenv from 'dotenv';
import aiOrchestrator from './services/aiOrchestrator.js';

dotenv.config();

async function testImprovedAI() {
  console.log('🚀 Testing Improved AI System\n');
  console.log('=' .repeat(70));

  const businessData = {
    revenue: 478686.3,
    orders: 2918,
    aov: 164.06,
    cogs: 150000,
    grossProfit: 328686.3,
    adSpend: 62000,
    shippingCost: 88587.3,
    netProfit: 178099,
    roas: 7.72,
    totalShipments: 2800,
    delivered: 2500,
    inTransit: 200,
    rto: 80,
    ndr: 20,
  };

  const testQueries = [
    {
      category: '📊 Simple Questions (Should be 1-2 sentences)',
      questions: [
        "What's my revenue?",
        "How many orders?",
        "What's my profit?",
        "What's my ROAS?",
        "How many RTO?",
      ]
    },
    {
      category: '🔮 Predictions (Should include forecasts)',
      questions: [
        "Predict next month revenue",
        "What will be my yearly revenue?",
        "When will I reach 10 lakh revenue?",
        "Project my profit for next quarter",
      ]
    },
    {
      category: '💡 Analysis (Should be actionable)',
      questions: [
        "Why is my RTO high?",
        "How to improve profit?",
        "Should I increase ad spend?",
        "How to increase AOV?",
      ]
    },
    {
      category: '📈 Comparisons (Should show trends)',
      questions: [
        "Is my ROAS good?",
        "Is my profit margin healthy?",
        "Am I spending too much on ads?",
      ]
    }
  ];

  for (const category of testQueries) {
    console.log(`\n${category.category}`);
    console.log('─'.repeat(70));

    for (const question of category.questions) {
      console.log(`\n❓ "${question}"`);
      
      try {
        const result = await aiOrchestrator.processQuery(
          'test-user-improved',
          question,
          businessData
        );

        if (result.success) {
          console.log(`\n💬 AI Response:`);
          console.log(result.response);
          
          // Check response length
          const wordCount = result.response.split(' ').length;
          const lineCount = result.response.split('\n').filter(l => l.trim()).length;
          
          console.log(`\n📏 Stats: ${wordCount} words, ${lineCount} lines`);
          
          // Validate response quality
          if (category.category.includes('Simple') && wordCount > 50) {
            console.log('⚠️  Warning: Response too long for simple question');
          }
          
          if (category.category.includes('Predictions') && !result.response.match(/\d+/)) {
            console.log('⚠️  Warning: No numbers in prediction');
          }
        } else {
          console.log(`❌ Error: ${result.error}`);
        }
      } catch (error) {
        console.log(`❌ Exception: ${error.message}`);
      }

      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✨ Testing Complete!\n');
}

testImprovedAI().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});
