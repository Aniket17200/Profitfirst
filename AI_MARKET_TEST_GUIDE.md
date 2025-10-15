# AI Market-Level Question Testing Guide

## Overview
This guide helps you test the AI chatbot's ability to answer market-level questions about current, past, and future data.

## Quick Start

### Option 1: Automated Test Suite
```bash
# Run the complete test suite
test-ai-market-complete.bat
```

### Option 2: Manual Testing
1. Start the server:
   ```bash
   node index.js
   ```

2. In another terminal, run the test:
   ```bash
   node test-ai-market-questions.js
   ```

## Test Categories

### 1. Current Data Questions ✅
Tests the AI's ability to provide real-time metrics:
- "What is the current total revenue?"
- "Show me today's gross profit margin"
- "What are the current market trends?"

**Expected Behavior:**
- Uses `currentMetrics` from dashboard data
- Provides up-to-date numbers
- Fast response time (<2s)

### 2. Past Data Questions 📊
Tests historical data retrieval and analysis:
- "What was the revenue last month?"
- "Show me the profit trends for the last 6 months"
- "How did we perform in Q1 2024?"
- "Compare this year vs last year revenue"

**Expected Behavior:**
- Uses `historicalData` from cache/database
- Provides accurate historical comparisons
- Shows trends and patterns

### 3. Future Data Questions 🔮
Tests prediction capabilities:
- "What will be the revenue next month?"
- "Predict the gross profit for next quarter"
- "What are the forecasted trends for the next 3 months?"
- "Will revenue increase or decrease next month?"

**Expected Behavior:**
- Uses ML predictions from `predictionService`
- Provides confidence levels
- Explains prediction basis

### 4. Mixed Timeframe Questions 🔄
Tests ability to combine multiple data sources:
- "Compare last month, this month, and next month revenue"
- "Show me the complete revenue trend from last year to next year"

**Expected Behavior:**
- Combines historical, current, and predicted data
- Creates comprehensive timeline view
- Maintains data consistency

## What the Test Checks

### ✅ Success Criteria
- AI responds within 30 seconds
- Response includes relevant data
- Correct data sources are used
- Answer is contextually appropriate

### 📊 Metrics Tracked
- Success rate per category
- Average response time
- Data sources utilized
- Error patterns

## Sample Output

```
================================================================================
Category: Current Data
Question: "What is the current total revenue?"
Expected Data Types: current metrics, revenue
================================================================================
✅ SUCCESS (1234ms)

AI Response:
Based on the current data, your total revenue is $125,450. This represents 
a 15% increase compared to last month...

📊 Data Sources Used:
  - currentMetrics: {"revenue": 125450, "timestamp": "2025-10-12"}
  - trends: {"direction": "up", "percentage": 15}

🔍 Context Information:
  - Has Current Data: true
  - Has Historical Data: true
  - Has Predictions: false
  - Has Trends: true
```

## Troubleshooting

### Server Not Running
```
❌ ERROR: Server not running (ECONNREFUSED)
```
**Solution:** Start the server with `node index.js`

### Timeout Errors
```
❌ ERROR: timeout of 30000ms exceeded
```
**Solution:** 
- Check if data is cached
- Verify Google Analytics connection
- Increase timeout in test file

### Missing Data
```
⚠️ WARNING: No historical data available
```
**Solution:**
- Run cache initialization: `node scripts/initCache.js`
- Check database connection
- Verify data extraction is working

## Advanced Testing

### Test Individual Questions
```javascript
// In Node.js console or separate file
import axios from 'axios';

const response = await axios.post('http://localhost:5000/api/chat', {
  message: 'What is the current revenue?',
  userId: 'test-user'
});

console.log(response.data);
```

### Test with Different User IDs
Modify the test file to use different `userId` values to test conversation context.

### Test Rate Limiting
Run multiple tests rapidly to verify rate limiting works correctly.

## Expected Results

### Healthy System
- ✅ Success Rate: >90%
- ⏱️ Avg Response Time: <3000ms
- 📊 All data types accessible
- 🔄 Smooth data transitions

### Issues to Watch For
- ❌ Low success rate in any category
- ⏱️ Response times >5000ms
- 📊 Missing data sources
- 🔄 Inconsistent data between timeframes

## Next Steps

After testing:
1. Review failed tests in detail
2. Check server logs for errors
3. Verify data pipeline is working
4. Test in production environment
5. Monitor real user interactions

## Files Involved
- `test-ai-market-questions.js` - Main test suite
- `test-ai-market-complete.bat` - Automated runner
- `controller/chatOptimized.js` - AI chat endpoint
- `services/aiOrchestrator.js` - Data orchestration
- `services/predictionService.js` - Future predictions
- `services/dashboardDataExtractor.js` - Current data
