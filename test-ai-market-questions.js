import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BASE_URL = 'http://localhost:3000';
const TEST_ENDPOINT = `${BASE_URL}/api/data/ai/test`;

// Test questions covering current, past, and future data
const testQuestions = [
  // Current data questions
  {
    category: 'Current Data',
    question: 'What is the current total revenue?',
    expectedDataTypes: ['current metrics', 'revenue']
  },
  {
    category: 'Current Data',
    question: 'Show me today\'s gross profit margin',
    expectedDataTypes: ['current metrics', 'profit margin']
  },
  {
    category: 'Current Data',
    question: 'What are the current market trends?',
    expectedDataTypes: ['current metrics', 'trends']
  },
  
  // Past data questions
  {
    category: 'Past Data',
    question: 'What was the revenue last month?',
    expectedDataTypes: ['historical data', 'revenue']
  },
  {
    category: 'Past Data',
    question: 'Show me the profit trends for the last 6 months',
    expectedDataTypes: ['historical data', 'trends', 'profit']
  },
  {
    category: 'Past Data',
    question: 'How did we perform in Q1 2024?',
    expectedDataTypes: ['historical data', 'quarterly']
  },
  {
    category: 'Past Data',
    question: 'Compare this year vs last year revenue',
    expectedDataTypes: ['historical data', 'comparison']
  },
  
  // Future data questions (predictions)
  {
    category: 'Future Data',
    question: 'What will be the revenue next month?',
    expectedDataTypes: ['predictions', 'revenue']
  },
  {
    category: 'Future Data',
    question: 'Predict the gross profit for next quarter',
    expectedDataTypes: ['predictions', 'profit']
  },
  {
    category: 'Future Data',
    question: 'What are the forecasted trends for the next 3 months?',
    expectedDataTypes: ['predictions', 'trends']
  },
  {
    category: 'Future Data',
    question: 'Will revenue increase or decrease next month?',
    expectedDataTypes: ['predictions', 'revenue', 'trends']
  },
  
  // Mixed timeframe questions
  {
    category: 'Mixed Timeframes',
    question: 'Compare last month, this month, and next month revenue',
    expectedDataTypes: ['historical', 'current', 'predictions']
  },
  {
    category: 'Mixed Timeframes',
    question: 'Show me the complete revenue trend from last year to next year',
    expectedDataTypes: ['historical', 'current', 'predictions']
  }
];

async function testAIQuestion(question, category, expectedDataTypes) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Category: ${category}`);
  console.log(`Question: "${question}"`);
  console.log(`Expected Data Types: ${expectedDataTypes.join(', ')}`);
  console.log('='.repeat(80));

  try {
    const startTime = Date.now();
    
    const response = await axios.post(TEST_ENDPOINT, {
      message: question,
    }, {
      timeout: 30000
    });

    const duration = Date.now() - startTime;
    
    if (response.data.success) {
      console.log(`✅ SUCCESS (${duration}ms)`);
      console.log(`\nAI Response:`);
      console.log(response.data.response);
      
      if (response.data.dataUsed) {
        console.log(`\n📊 Data Sources Used:`);
        Object.entries(response.data.dataUsed).forEach(([key, value]) => {
          if (value && typeof value === 'object') {
            console.log(`  - ${key}: ${JSON.stringify(value).substring(0, 100)}...`);
          } else {
            console.log(`  - ${key}: ${value}`);
          }
        });
      }
      
      if (response.data.context) {
        console.log(`\n🔍 Context Information:`);
        console.log(`  - Has Current Data: ${!!response.data.context.currentMetrics}`);
        console.log(`  - Has Historical Data: ${!!response.data.context.historicalData}`);
        console.log(`  - Has Predictions: ${!!response.data.context.predictions}`);
        console.log(`  - Has Trends: ${!!response.data.context.trends}`);
      }
      
      return {
        success: true,
        category,
        question,
        duration,
        response: response.data.response,
        dataUsed: response.data.dataUsed,
        context: response.data.context
      };
    } else {
      console.log(`❌ FAILED: ${response.data.error}`);
      return {
        success: false,
        category,
        question,
        error: response.data.error
      };
    }
  } catch (error) {
    const errorMsg = error.code === 'ECONNREFUSED' 
      ? 'Server not running (ECONNREFUSED)' 
      : error.message;
    console.log(`❌ ERROR: ${errorMsg}`);
    if (error.response?.data) {
      console.log(`Server Response:`, error.response.data);
    }
    return {
      success: false,
      category,
      question,
      error: errorMsg
    };
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting AI Market-Level Question Tests');
  console.log(`Testing ${testQuestions.length} questions across different timeframes\n`);

  const results = [];
  
  for (const test of testQuestions) {
    const result = await testAIQuestion(
      test.question,
      test.category,
      test.expectedDataTypes
    );
    results.push(result);
    
    // Wait between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`✅ Passed: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`Success Rate: ${((successCount / results.length) * 100).toFixed(1)}%`);

  // Group by category
  const categories = {};
  results.forEach(r => {
    if (!categories[r.category]) {
      categories[r.category] = { passed: 0, failed: 0 };
    }
    if (r.success) {
      categories[r.category].passed++;
    } else {
      categories[r.category].failed++;
    }
  });

  console.log('\n📈 Results by Category:');
  Object.entries(categories).forEach(([category, stats]) => {
    const total = stats.passed + stats.failed;
    const rate = ((stats.passed / total) * 100).toFixed(1);
    console.log(`  ${category}: ${stats.passed}/${total} (${rate}%)`);
  });

  // Average response time
  const successfulResults = results.filter(r => r.success && r.duration);
  if (successfulResults.length > 0) {
    const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
    console.log(`\n⏱️  Average Response Time: ${avgDuration.toFixed(0)}ms`);
  }

  // Failed tests details
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:');
    failedTests.forEach(test => {
      console.log(`  - [${test.category}] ${test.question}`);
      console.log(`    Error: ${test.error}`);
    });
  }

  console.log('\n' + '='.repeat(80));
}

// Run the tests
runAllTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
