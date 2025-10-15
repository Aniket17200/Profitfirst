import dotenv from 'dotenv';
import axios from 'axios';
import readline from 'readline';

dotenv.config();

const BASE_URL = 'http://localhost:3000';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🤖 AI Market Question Interactive Tester');
console.log('==========================================\n');
console.log('Ask questions about:');
console.log('  📊 Current data: "What is the current revenue?"');
console.log('  📈 Past data: "What was revenue last month?"');
console.log('  🔮 Future data: "Predict next month\'s revenue"');
console.log('  🔄 Mixed: "Compare last, current, and next month"\n');
console.log('Type "exit" to quit\n');

async function askQuestion(question) {
  try {
    console.log(`\n⏳ Processing: "${question}"\n`);
    const startTime = Date.now();
    
    const response = await axios.post(`${BASE_URL}/api/chat`, {
      message: question,
      userId: 'interactive-test-user'
    }, {
      timeout: 30000
    });

    const duration = Date.now() - startTime;
    
    if (response.data.success) {
      console.log(`✅ Response (${duration}ms):\n`);
      console.log(response.data.response);
      
      if (response.data.context) {
        console.log(`\n📊 Data Sources:`);
        console.log(`  Current: ${response.data.context.currentMetrics ? '✓' : '✗'}`);
        console.log(`  Historical: ${response.data.context.historicalData ? '✓' : '✗'}`);
        console.log(`  Predictions: ${response.data.context.predictions ? '✓' : '✗'}`);
        console.log(`  Trends: ${response.data.context.trends ? '✓' : '✗'}`);
      }
    } else {
      console.log(`❌ Error: ${response.data.error}`);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server not running. Start it with: node index.js');
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

function promptUser() {
  rl.question('Your question: ', async (input) => {
    const question = input.trim();
    
    if (question.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!\n');
      rl.close();
      process.exit(0);
    }
    
    if (question) {
      await askQuestion(question);
    }
    
    promptUser();
  });
}

// Check server first
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 2000 });
    console.log('✅ Server is running\n');
    promptUser();
  } catch (error) {
    console.log('⚠️  Server not detected. Make sure to start it with: node index.js\n');
    console.log('Continuing anyway...\n');
    promptUser();
  }
}

checkServer();
