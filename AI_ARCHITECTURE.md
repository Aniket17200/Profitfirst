# AI Analytics Architecture

## Overview
This document describes the improved AI analytics system using LangGraph orchestration and Pinecone vector database for better context-aware responses.

## Architecture

```
User Query
    ↓
AI Orchestrator (LangGraph)
    ↓
┌─────────────────────────────────┐
│   Query Analysis                │
│   - Determine query type        │
│   - Extract intent              │
│   - Identify metrics needed     │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│   Context Retrieval             │
│   - Query Pinecone Vector DB    │
│   - Get relevant historical data│
│   - Fetch similar queries       │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│   Data Aggregation              │
│   ├── Shopify API               │
│   ├── Meta Ads API              │
│   └── Shiprocket API            │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│   Response Generation           │
│   - Combine context + live data │
│   - Generate insights           │
│   - Provide recommendations     │
└─────────────────────────────────┘
    ↓
Response to User
```

## Components

### 1. Vector Store Service (`services/vectorStore.js`)
- **Purpose**: Store and retrieve business context using Pinecone
- **Features**:
  - Stores historical business metrics
  - Enables semantic search for relevant context
  - Maintains user-specific data isolation
  - Uses OpenAI embeddings (text-embedding-3-small)

### 2. AI Orchestrator (`services/aiOrchestrator.js`)
- **Purpose**: Coordinate the AI workflow using LangGraph
- **Workflow**:
  1. **Analyze Query**: Understand user intent and required metrics
  2. **Fetch Context**: Retrieve relevant historical data from Pinecone
  3. **Generate Response**: Combine context with live data for accurate answers

### 3. Data Aggregator (`services/dataAggregator.js`)
- **Purpose**: Fetch and aggregate data from all connected platforms
- **Data Sources**:
  - Shopify: Orders, revenue, products
  - Meta Ads: Spend, ROAS, impressions, clicks
  - Shiprocket: Shipments, delivery status, costs

### 4. Improved Chat Controller (`controller/chatImproved.js`)
- **Endpoints**:
  - `POST /api/data/ai/init` - Initialize chat with business context
  - `POST /api/data/ai/chat` - Send message and get AI response
  - `GET /api/data/ai/insights` - Get automated business insights

## API Endpoints

### Initialize Chat
```http
POST /api/data/ai/init
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Chat initialized with business context",
  "sessionId": "user_id",
  "dataRange": {
    "startDate": "2025-01-13",
    "endDate": "2025-02-12"
  }
}
```

### Send Chat Message
```http
POST /api/data/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Why is my ROAS decreasing?"
}

Response:
{
  "success": true,
  "reply": "Based on your data...",
  "metadata": {
    "queryType": "trends",
    "contextUsed": 5,
    "timestamp": "2025-02-12T10:30:00Z"
  }
}
```

### Get Business Insights
```http
GET /api/data/ai/insights
Authorization: Bearer <token>

Response:
{
  "success": true,
  "insights": "Top 5 actionable insights...",
  "metrics": {
    "revenue": 500000,
    "orders": 250,
    "aov": 2000,
    ...
  }
}
```

## Environment Variables

Add these to your `.env` file:

```env
# OpenAI
OPENAI_API_KEY=your_openai_key

# Pinecone
PINECONE_API_KEY=pcsk_2oD7Cz_SauwVxHze8XhnFQLvuskjjKMKNNhRBFDmG69YtvhSFBLZ3KFKM5KC6v5LBzicN4
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=profitfirst-analytics
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. The new dependencies include:
   - `@langchain/openai` - OpenAI integration
   - `@langchain/pinecone` - Pinecone vector store
   - `@pinecone-database/pinecone` - Pinecone client
   - `langchain` - LangChain framework
   - `langgraph` - LangGraph orchestration

3. Start the server:
```bash
npm run dev
```

## Benefits

### 1. Better Context Awareness
- Stores historical queries and responses
- Retrieves relevant past data for better answers
- Understands business trends over time

### 2. Improved Accuracy
- Multi-step reasoning with LangGraph
- Combines historical context with live data
- Validates answers against actual metrics

### 3. Scalability
- Vector database handles large amounts of data
- Efficient semantic search
- User-specific data isolation

### 4. Actionable Insights
- Analyzes query intent
- Provides specific recommendations
- References actual data points

## Usage Example

```javascript
// Frontend code
const initChat = async () => {
  const response = await fetch('/api/data/ai/init', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  console.log('Chat initialized:', data);
};

const sendMessage = async (message) => {
  const response = await fetch('/api/data/ai/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  const data = await response.json();
  console.log('AI Response:', data.reply);
};

// Initialize chat on component mount
useEffect(() => {
  initChat();
}, []);

// Send message
sendMessage('What are my top performing products?');
```

## Migration from Legacy Chat

The legacy chat endpoints (`/newchat`, `/chatmessage`) are still available for backward compatibility. To migrate:

1. Replace `/newchat` with `/ai/init`
2. Replace `/chatmessage` with `/ai/chat`
3. Update request/response handling as per new API format

## Monitoring

The system logs important events:
- ✅ Vector store initialization
- ✅ Context storage
- ✅ Query processing
- ❌ Errors with detailed messages

Check console logs for debugging.

## Future Enhancements

1. **Multi-turn conversations**: Maintain conversation history
2. **Predictive analytics**: Forecast future trends
3. **Automated alerts**: Proactive notifications
4. **Custom training**: Fine-tune on business-specific data
5. **Multi-language support**: Support regional languages
