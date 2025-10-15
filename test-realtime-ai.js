import dotenv from 'dotenv';
import aiOrchestrator from './services/aiOrchestrator.js';

dotenv.config();

async function testRealtimeAI() {
  console.log('🔴 Testing Real-Time AI System\n');
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
    dataRange: {
      startDate: '2025-01-13',
      endDate: '2025-02-12',
      daysIncluded: 30,
      isRealTime: true,
    }
  };

  const realtimeQuestions = [
    "What are today's orders?",
    "Tell me today's orders",
    "How many orders today?",
    "What's my current revenue?",
    "Today's sales?",
    "Current profit?",
    "Show me today's data",
    "What's happening today?",
  ];

  console.log('\n🔴 REAL-TIME QUESTIONS TEST\n');
  console.log('Testing if AI says it has real-time access...\n');
  console.log('─'.repeat(70));

  let passedTests = 0;
  let failedTests = 0;

  for (const question of realtimeQuestions) {
    console.log(`\n❓ "${question}"`);
    
    try {
      const result = await aiOrchestrator.processQuery(
        'test-realtime-user',
        question,
        businessData
      );

      if (result.success) {
        const response = result.response.toLowerCase();
        
        // Check if AI says it doesn't have access
        const badPhrases = [
          "don't have access",
          "can't provide",
          "don't have real-time",
          "historical data",
          "not able to",
          "unable to provide",
          "can't access",
        ];
        
        const hasBadPhrase = badPhrases.some(phrase => response.includes(phrase));
        
        // Check if AI provides actual numbers
        const hasNumbers = /\d+/.test(response);
        
        console.log(`\n💬 AI Response:`);
        console.log(result.response);
        
        if (hasBadPhrase) {
          console.log(`\n❌ FAILED - AI says it doesn't have access`);
          failedTests++;
        } else if (!hasNumbers) {
          console.log(`\n⚠️  WARNING - No numbers in response`);
          failedTests++;
        } else {
          console.log(`\n✅ PASSED - AI provided real-time data`);
          passedTests++;
        }
      } else {
        console.log(`❌ Error: ${result.error}`);
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ Exception: ${error.message}`);
      failedTests++;
    }

    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${passedTests}/${realtimeQuestions.length}`);
  console.log(`   ❌ Failed: ${failedTests}/${realtimeQuestions.length}`);
  console.log(`   📈 Success Rate: ${((passedTests / realtimeQuestions.length) * 100).toFixed(1)}%`);

  if (passedTests === realtimeQuestions.length) {
    console.log('\n🎉 Perfect! AI understands it has real-time access!');
  } else if (passedTests >= realtimeQuestions.length * 0.8) {
    console.log('\n✅ Good! Most tests passed.');
  } else {
    console.log('\n❌ AI still thinks it doesn\'t have real-time access.');
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✨ Real-time testing complete!\n');
}

testRealtimeAI().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});
