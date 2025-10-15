import dotenv from 'dotenv';
import aiOrchestrator from './services/aiOrchestrator.js';

dotenv.config();

async function testAIAccuracy() {
  console.log('🎯 Testing AI Answer Accuracy\n');
  console.log('=' .repeat(60));

  // Sample business data (matching dashboard calculations)
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

  console.log('\n📊 Test Data:');
  console.log(`   Revenue: ₹${businessData.revenue.toLocaleString('en-IN')}`);
  console.log(`   Orders: ${businessData.orders}`);
  console.log(`   Net Profit: ₹${businessData.netProfit.toLocaleString('en-IN')}`);
  console.log(`   ROAS: ${businessData.roas}x`);
  console.log(`   Gross Profit: ₹${businessData.grossProfit.toLocaleString('en-IN')}`);

  const testCases = [
    {
      question: "What's my revenue?",
      expectedKeywords: ['478686', '4,78,686', '478,686'],
      expectedValue: 478686.3,
      tolerance: 1,
    },
    {
      question: "How many orders do I have?",
      expectedKeywords: ['2918', '2,918'],
      expectedValue: 2918,
      tolerance: 0,
    },
    {
      question: "What's my net profit?",
      expectedKeywords: ['178099', '1,78,099', '178,099'],
      expectedValue: 178099,
      tolerance: 1,
    },
    {
      question: "What's my ROAS?",
      expectedKeywords: ['7.72', '7.7'],
      expectedValue: 7.72,
      tolerance: 0.1,
    },
    {
      question: "What's my gross profit?",
      expectedKeywords: ['328686', '3,28,686', '328,686'],
      expectedValue: 328686.3,
      tolerance: 1,
    },
  ];

  console.log('\n🧪 Running Accuracy Tests...\n');
  console.log('─'.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Question: "${testCase.question}"`);
    console.log(`   Expected: ${testCase.expectedValue.toLocaleString('en-IN')}`);

    try {
      const result = await aiOrchestrator.processQuery(
        'test-user-accuracy',
        testCase.question,
        businessData
      );

      if (result.success) {
        const response = result.response;
        console.log(`   AI Response: ${response.substring(0, 150)}...`);

        // Check if any expected keyword is in the response
        const hasKeyword = testCase.expectedKeywords.some(keyword =>
          response.includes(keyword)
        );

        if (hasKeyword) {
          console.log(`   ✅ PASSED - Found expected value in response`);
          passed++;
        } else {
          console.log(`   ❌ FAILED - Expected value not found`);
          console.log(`   Looking for: ${testCase.expectedKeywords.join(' or ')}`);
          failed++;
        }
      } else {
        console.log(`   ❌ FAILED - AI error: ${result.error}`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ FAILED - Exception: ${error.message}`);
      failed++;
    }

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
  console.log(`   ❌ Failed: ${failed}/${testCases.length}`);
  console.log(`   📈 Accuracy: ${((passed / testCases.length) * 100).toFixed(1)}%`);

  if (passed === testCases.length) {
    console.log('\n🎉 All tests passed! AI is giving accurate answers.');
  } else if (passed >= testCases.length * 0.8) {
    console.log('\n⚠️  Most tests passed, but some need attention.');
  } else {
    console.log('\n❌ Many tests failed. AI needs debugging.');
  }

  console.log('\n' + '='.repeat(60));

  // Additional context test
  console.log('\n🔍 Testing Context Awareness...\n');

  const contextTest = {
    question: "Give me 3 actionable insights to improve my business",
  };

  console.log(`📝 Question: "${contextTest.question}"`);

  try {
    const result = await aiOrchestrator.processQuery(
      'test-user-accuracy',
      contextTest.question,
      businessData
    );

    if (result.success) {
      console.log(`\n💡 AI Insights:\n`);
      console.log(result.response);
      console.log(`\n✅ Context test passed - AI provided insights`);
    } else {
      console.log(`\n❌ Context test failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`\n❌ Context test failed: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✨ Accuracy testing complete!\n');
}

testAIAccuracy().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
});
