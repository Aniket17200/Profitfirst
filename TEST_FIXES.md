# Testing the Fixes

## Quick Test Checklist

### ✅ 1. Server Starts Without Errors
```bash
npm run dev
```
**Expected**: Server starts on port 3000 without crashes

### ✅ 2. Test Diagnostics Endpoint
```bash
curl -X GET http://localhost:3000/api/data/diagnostics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
**Expected**: JSON response with API status

### ✅ 3. Test Chat Initialization
```bash
curl -X POST http://localhost:3000/api/data/ai/init \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
**Expected**: Success response even if some APIs fail

### ✅ 4. Test Chat Message
```bash
curl -X POST http://localhost:3000/api/data/ai/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is my current revenue?"}'
```
**Expected**: AI response even with partial data

### ✅ 5. Test Legacy Chat
```bash
curl -X POST http://localhost:3000/api/data/newchat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": {"revenue": 100000, "orders": 50}}'
```
**Expected**: Assistant and thread IDs returned

### ✅ 6. Check Console Logs
Look for these patterns:
- ✅ Success messages (green checkmarks)
- ⚠️ Warning messages (yellow warnings) - OK if APIs are unavailable
- ❌ Error messages (red X) - Should not crash the app

## Expected Behavior

### When All APIs Work
- ✅ Full data aggregation
- ✅ Accurate AI responses
- ✅ Complete metrics

### When Shiprocket Fails (401)
- ⚠️ Warning: "Shiprocket authentication failed"
- ✅ App continues with Shopify + Meta data
- ✅ Shipping metrics show 0
- ✅ AI still provides insights

### When Shopify Fails
- ⚠️ Warning: "Shopify fetch error"
- ✅ App continues with Meta + Shiprocket data
- ✅ Order metrics show 0
- ✅ AI still provides insights

### When All APIs Fail
- ⚠️ Multiple warnings
- ✅ App returns fallback data
- ✅ AI explains data is unavailable
- ✅ No crashes

## Frontend Testing

### 1. Open Frontend
```
http://localhost:5173
```

### 2. Login and Navigate to Chat

### 3. Try These Questions
- "What is my revenue?"
- "How many orders do I have?"
- "What's my ROAS?"
- "Show me my top products"

### 4. Expected Results
- Even if some data is missing, chat should respond
- Error messages should be user-friendly
- No blank screens or crashes

## Troubleshooting

### If Server Won't Start
```bash
# Reinstall dependencies
npm install --legacy-peer-deps

# Check for syntax errors
npm run dev
```

### If Diagnostics Fails
- Check if user is authenticated
- Verify JWT token is valid
- Check user has onboarding data

### If Chat Doesn't Respond
1. Check OpenAI API key in .env
2. Verify Pinecone is initialized
3. Check console for specific errors

## Success Criteria

✅ **Server starts without errors**
✅ **Diagnostics endpoint works**
✅ **Chat works even with API failures**
✅ **No application crashes**
✅ **Clear error messages in logs**
✅ **Graceful degradation**

## Performance Benchmarks

- **Diagnostics**: < 1 second
- **Chat Init**: 2-5 seconds
- **Chat Message**: 3-8 seconds
- **Data Aggregation**: 5-15 seconds (depending on APIs)

## Next Steps After Testing

1. ✅ If all tests pass → Deploy to production
2. ⚠️ If some APIs fail → Update credentials
3. ❌ If tests fail → Check error logs and fix issues

## Production Checklist

Before deploying:
- [ ] All environment variables set
- [ ] API credentials valid
- [ ] Pinecone index created
- [ ] OpenAI API key working
- [ ] Frontend built (`cd client && npm run build`)
- [ ] CORS configured for production domain
- [ ] SSL/TLS certificates configured

## Monitoring in Production

Watch for these patterns:
- High frequency of 401 errors → Tokens expired
- Slow response times → API rate limits
- Fallback data being used → API connectivity issues

Set up alerts for:
- Multiple consecutive API failures
- High error rates
- Slow response times (> 30 seconds)
