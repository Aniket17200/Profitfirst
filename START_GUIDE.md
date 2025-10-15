# Start Guide - Profit First AI Analytics

## Prerequisites
- Node.js (v18 or higher)
- MongoDB connection
- API credentials for:
  - OpenAI
  - Pinecone
  - Shopify
  - Meta Ads
  - Shiprocket

## Quick Start

### 1. Install Dependencies

```bash
# Backend
npm install --legacy-peer-deps

# Frontend
cd client
npm install
cd ..
```

### 2. Configure Environment Variables

Make sure your `.env` file has all required variables:

```env
# Server
PORT=3000

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret

# Email
MAIL_USER=your_email
MAIL_PASS=your_email_password

# Frontend
FRONTEND_URL=http://localhost:5173

# OpenAI
OPENAI_API_KEY=your_openai_key

# Pinecone Vector Database
PINECONE_API_KEY=pcsk_2oD7Cz_SauwVxHze8XhnFQLvuskjjKMKNNhRBFDmG69YtvhSFBLZ3KFKM5KC6v5LBzicN4
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=profitfirst-analytics

# Facebook/Meta
FB_APP_ID=your_fb_app_id
FB_APP_SECRET=your_fb_app_secret
```

### 3. Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend will start on `http://localhost:3000`

### 4. Start Frontend (in a new terminal)

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173`

## Testing the AI System

### 1. Initialize Chat
```bash
curl -X POST http://localhost:3000/api/data/ai/init \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Send a Message
```bash
curl -X POST http://localhost:3000/api/data/ai/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is my current ROAS?"}'
```

### 3. Get Business Insights
```bash
curl -X GET http://localhost:3000/api/data/ai/insights \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Architecture Components

### Backend Services
- **Vector Store** (`services/vectorStore.js`) - Pinecone integration
- **AI Orchestrator** (`services/aiOrchestrator.js`) - LangGraph workflow
- **Data Aggregator** (`services/dataAggregator.js`) - Multi-platform data fetching

### API Endpoints
- `POST /api/data/ai/init` - Initialize AI chat session
- `POST /api/data/ai/chat` - Send message to AI
- `GET /api/data/ai/insights` - Get automated insights
- `GET /api/data/getData` - Get daily analytics data
- `GET /api/data/aiprediction` - Get AI predictions

### Legacy Endpoints (Still Available)
- `POST /api/data/newchat` - Legacy chat initialization
- `POST /api/data/chatmessage` - Legacy chat message

## Troubleshooting

### Pinecone Connection Issues
If you see Pinecone errors:
1. Verify your API key is correct
2. Check if the index exists in your Pinecone dashboard
3. The system will auto-create the index if it doesn't exist

### OpenAI Rate Limits
If you hit rate limits:
1. Check your OpenAI usage dashboard
2. Consider upgrading your plan
3. Implement request throttling

### Data Fetching Errors
If platform APIs fail:
1. Verify all API tokens are valid
2. Check token permissions
3. Ensure onboarding is complete for the user

## Development Tips

### Hot Reload
The backend uses `nodemon` for auto-reload during development:
```bash
npm run dev
```

### Debugging
Enable detailed logging by checking console output. Look for:
- ✅ Success messages (green checkmarks)
- ❌ Error messages (red X marks)

### Testing Individual Services
You can test services independently:

```javascript
// Test vector store
import vectorStore from './services/vectorStore.js';
await vectorStore.initialize();

// Test AI orchestrator
import aiOrchestrator from './services/aiOrchestrator.js';
const result = await aiOrchestrator.processQuery(userId, query, data);

// Test data aggregator
import dataAggregator from './services/dataAggregator.js';
const data = await dataAggregator.aggregateAllData(user, startDate, endDate);
```

## Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use production MongoDB cluster
3. Configure proper CORS settings
4. Set up SSL/TLS certificates

### Build Frontend
```bash
cd client
npm run build
cd ..
```

The built files will be in `client/dist` and served by Express.

### Start Production Server
```bash
npm start
```

## Monitoring

### Health Checks
Monitor these endpoints:
- Backend: `http://localhost:3000/api/`
- Frontend: `http://localhost:5173/`

### Logs
Check console logs for:
- API request/response times
- Vector store operations
- AI query processing
- Data aggregation status

## Support

For issues or questions:
1. Check `AI_ARCHITECTURE.md` for detailed architecture
2. Review error logs in console
3. Verify all environment variables are set
4. Ensure all API credentials are valid

## Next Steps

1. Complete user onboarding with all platform integrations
2. Initialize AI chat for each user
3. Store business context in vector database
4. Start querying the AI assistant
5. Monitor insights and recommendations
