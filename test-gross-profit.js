import dotenv from 'dotenv';
import aiOrchestrator from './services/aiOrchestrator.js';

dotenv.config();

async function testGrossProfit() {
  console.log('🧪 Testing Gross Profit Accuracy\n');
  console.log('=' .repeat(70));

  // Sample data with known gross profit
  const businessData = {
    revenue: 478686.3,
    orders: 2918,
    aov: 164.06,
    cogs: 150000,
    grossProfit: 328686.3, // Revenue - COGS = 478686.3 - 150000 = 328686.3
    adSpend: 62000,
    shippingCost: 88587.3,
    netProfit: 178099, // Gross Profit - Ad Spend - Shipping = 328686.3 - 62000 - 88587.3 = 178099
    roas: 7.72,
    totalShipments: 2800,
    delivered: 2500,
    inTransit: 200,
    rto: 80,
    ndr: 20,
  };

  console.log('\n📊 Test Data:');
  console.log(`   Revenue: ₹${businessData.revenue.toLocaleString('en-IN')}`);
  console.log(`   COGS: ₹${businessData.cogs.toLocaleString('en-IN')}`);
  console.log(`   Gross Profit: ₹${businessData.grossProfit.toLocaleString('en-IN')}`);
  console.log(`   Formula: Revenue - COGS = ${businessData.revenue} - ${businessData.cogs} = ${businessData.grossProfit}`);

  const testQuestions = [
    {
      question: "What's my gross profit?",
      expectedAnswer: "328686.3",
      expectedFormatted: "₹3,28,686",
    },
    {
      question: "Tell me my gross profit",
      expectedAnswer: "328686.3",
      expectedFormatted: "₹3,28,686",
    },
    {
      question: "gross profit of 30 days",
      expectedAnswer: "328686.3",
      expectedFormatted: "₹3,28,686",
    },
    {
      question: "What is my gross profit for the last 30 days?",
      expectedAnswer: "328686.3",
      expectedFormatted: "₹3,28,686",
    },
  ];

  console.log('\n🧪 Running Tests...\n');
  console.log('─'.repeat(70));

  let passed = 0;
  let failed = 0;

  for (const test of testQuestions) {
    console.log(`\n❓ "${test.question}"`);
    console.log(`   Expected: ${test.expectedFormatted}`);

    try {
      const result = await aiOrchestrator.processQuery(
        'test-gross-profit-user',
        test.question,
        businessData
      );

      if (result.success) {
        const response = result.response;
        console.log(`   AI Response: ${response}`);

        // Check if the response contains the correct number
        const hasCorrectNumber = 
          response.includes('328686') || 
          response.includes('3,28,686') ||
          response.includes('₹3,28,686');

        // Check if it has the WRONG number (444056)
        const hasWrongNumber = 
          response.includes('444056') || 
          response.includes('4,44,056');

        if (hasWrongNumber) {
          console.log(`   ❌ FAILED - AI gave wrong number (₹4,44,056 instead of ₹3,28,686)`);
          failed++;
        } else if (hasCorrectNumber) {
          console.log(`   ✅ PASSED - Correct gross profit`);
          passed++;
        } else {
          console.log(`   ⚠️  WARNING - Number not found in response`);
          failed++;
        }
      } else {
        console.log(`   ❌ Error: ${result.error}`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
      failed++;
    }

    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}/${testQuestions.length}`);
  console.log(`   ❌ Failed: ${failed}/${testQuestions.length}`);
  console.log(`   📈 Accuracy: ${((passed / testQuestions.length) * 100).toFixed(1)}%`);

  if (passed === testQuestions.length) {
    console.log('\n🎉 Perfect! AI is giving correct gross profit!');
  } else {
    console.log('\n❌ AI is still giving wrong numbers. Need to fix the prompt.');
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✨ Testing complete!\n');
}

testGrossProfit().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});
