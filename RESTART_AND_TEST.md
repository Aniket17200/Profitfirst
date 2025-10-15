# 🔄 Restart Server and Test

## Issue Fixed
- ✅ Port changed from 5000 to 3000
- ✅ Fixed `getDemoData` function error
- ✅ Using hardcoded demo data

## Steps to Test

### 1. Stop Current Server
In the terminal running the server, press:
```
Ctrl + C
```

### 2. Start Server Again
```bash
node index.js
```

Wait for: `Server listening at http://localhost:3000`

### 3. Run Test (in another terminal)
```bash
node test-ai-market-questions.js
```

## Expected Result
```
✅ SUCCESS (1234ms)

AI Response:
Your current revenue is ₹47,86,863 from 2,918 orders over the last 30 days.

📊 Data Sources Used:
  - revenue: 4786863
  - orders: 2918
  - grossProfit: 2845178
```

## Quick Command
```bash
# Stop server (Ctrl+C), then:
node index.js

# In another terminal:
node test-ai-market-questions.js
```
