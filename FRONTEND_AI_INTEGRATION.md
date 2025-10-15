# Frontend AI Integration Guide

## 🚀 Quick Start

The AI system is now fully operational with two options:

### Option 1: Advanced AI (Recommended)
Uses LangGraph + Pinecone for context-aware responses

### Option 2: Basic AI (Fallback)
Uses OpenAI Assistants API directly

---

## 📡 API Endpoints

### Advanced AI System (NEW)

#### 1. Initialize Chat Session
```javascript
POST /api/data/ai/init

Headers:
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}

Response:
{
  "success": true,
  "message": "Chat initialized",
  "sessionId": "user_id",
  "dataRange": {
    "startDate": "2025-01-13",
    "endDate": "2025-02-12"
  }
}
```

#### 2. Send Message
```javascript
POST /api/data/ai/chat

Headers:
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}

Body:
{
  "message": "What's my revenue?"
}

Response:
{
  "success": true,
  "reply": "Your revenue is ₹4,78,686 from 2,918 orders...",
  "metadata": {
    "queryType": "metrics",
    "contextUsed": 3,
    "timestamp": "2025-02-12T10:30:00.000Z"
  }
}
```

#### 3. Get Business Insights
```javascript
GET /api/data/ai/insights

Headers:
{
  "Authorization": "Bearer <token>"
}

Response:
{
  "success": true,
  "insights": "Top 5 actionable insights:\n1. Your ROAS is excellent at 7.72x...",
  "metrics": {
    "revenue": 478686.3,
    "orders": 2918,
    "netProfit": 178099,
    ...
  }
}
```

---

## 💻 React Implementation Example

### Complete Chat Component

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/data/ai/init',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setInitialized(true);
        console.log('AI Chat initialized');
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !initialized) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/data/ai/chat',
        { message: input },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const aiMessage = {
          role: 'assistant',
          content: response.data.reply,
          metadata: response.data.metadata
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-container">
      <div className="chat-header">
        <h3>Profit First AI Assistant</h3>
        {initialized ? (
          <span className="status-badge success">● Connected</span>
        ) : (
          <span className="status-badge loading">● Connecting...</span>
        )}
      </div>

      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.content}
            </div>
            {msg.metadata && (
              <div className="message-meta">
                Context used: {msg.metadata.contextUsed} documents
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message assistant loading">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about your business metrics..."
          disabled={!initialized || loading}
        />
        <button
          onClick={sendMessage}
          disabled={!initialized || loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIChat;
```

### Insights Panel Component

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BusinessInsights = () => {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/data/ai/insights', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setInsights(response.data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="insights-loading">Loading insights...</div>;
  }

  return (
    <div className="business-insights">
      <h3>AI Business Insights</h3>
      <div className="insights-content">
        {insights.split('\n').map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>
      <button onClick={fetchInsights} className="refresh-btn">
        Refresh Insights
      </button>
    </div>
  );
};

export default BusinessInsights;
```

---

## 🎨 Suggested UI/UX

### Chat Interface
```
┌─────────────────────────────────────┐
│ Profit First AI Assistant    ● Live │
├─────────────────────────────────────┤
│                                     │
│  User: What's my revenue?           │
│                                     │
│  AI: Your revenue is ₹4,78,686      │
│      from 2,918 orders over the     │
│      last 30 days.                  │
│      Context: 3 docs                │
│                                     │
│  User: How can I improve it?        │
│                                     │
│  AI: Here are 3 ways to boost       │
│      your revenue:                  │
│      1. Increase AOV...             │
│      2. Reduce RTO...               │
│      3. Optimize ad spend...        │
│                                     │
├─────────────────────────────────────┤
│ [Ask about your business...]  [Send]│
└─────────────────────────────────────┘
```

### Quick Action Buttons
```jsx
const QuickActions = ({ onAsk }) => {
  const questions = [
    "What's my revenue?",
    "How's my profit margin?",
    "Why is my RTO high?",
    "Show me top products",
    "Compare this week vs last week"
  ];

  return (
    <div className="quick-actions">
      <p>Quick questions:</p>
      {questions.map((q, idx) => (
        <button
          key={idx}
          onClick={() => onAsk(q)}
          className="quick-action-btn"
        >
          {q}
        </button>
      ))}
    </div>
  );
};
```

---

## 📊 Sample Queries

### Revenue & Orders
```
"What's my total revenue?"
"How many orders did I get?"
"What's my average order value?"
"Show me revenue by day"
```

### Profitability
```
"What's my profit margin?"
"How much profit did I make?"
"What's my COGS?"
"Calculate my gross profit"
```

### Marketing
```
"How's my ROAS?"
"What's my ad spend?"
"How many clicks did I get?"
"Is my CPP good?"
```

### Shipping
```
"How many deliveries?"
"What's my RTO rate?"
"Show shipping costs"
"Why is my RTO high?"
```

### Comparisons
```
"Compare this week vs last week"
"How am I doing vs last month?"
"Show me the trend"
```

### Recommendations
```
"How can I improve profit?"
"What should I focus on?"
"Give me actionable insights"
"What's working well?"
```

---

## 🎯 Best Practices

### 1. Error Handling
```javascript
try {
  const response = await sendAIMessage(message);
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired - redirect to login
  } else if (error.response?.status === 429) {
    // Rate limited - show retry message
  } else {
    // Generic error
    showError('Failed to get response. Please try again.');
  }
}
```

### 2. Loading States
```jsx
{loading && (
  <div className="ai-thinking">
    <span className="spinner"></span>
    AI is analyzing your data...
  </div>
)}
```

### 3. Context Indicators
```jsx
{metadata.contextUsed > 0 && (
  <div className="context-badge">
    📚 Used {metadata.contextUsed} historical insights
  </div>
)}
```

### 4. Retry Logic
```javascript
const sendWithRetry = async (message, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await sendAIMessage(message);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};
```

---

## 🔧 Configuration

### Axios Instance
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  timeout: 30000, // AI responses can take time
});

// Add auth token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_AI_TIMEOUT=30000
```

---

## 🐛 Troubleshooting

### Chat Not Initializing
```javascript
// Check if user is authenticated
if (!localStorage.getItem('token')) {
  console.error('User not authenticated');
  // Redirect to login
}

// Check API connection
try {
  await axios.get('/api/health');
} catch (error) {
  console.error('API not reachable');
}
```

### Slow Responses
- AI responses typically take 2-5 seconds
- Show loading indicator
- Set timeout to 30 seconds
- Implement retry logic

### Empty Responses
```javascript
if (!response.data.reply || response.data.reply.trim() === '') {
  // Fallback message
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: 'I apologize, but I couldn\'t generate a response. Please try rephrasing your question.'
  }]);
}
```

---

## 📱 Mobile Considerations

### Responsive Design
```css
.ai-chat-container {
  max-width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .messages-container {
    padding: 10px;
  }
  
  .message {
    font-size: 14px;
  }
  
  .quick-action-btn {
    font-size: 12px;
    padding: 8px 12px;
  }
}
```

### Touch Optimization
```jsx
<button
  onClick={sendMessage}
  onTouchEnd={(e) => {
    e.preventDefault();
    sendMessage();
  }}
  className="send-btn"
>
  Send
</button>
```

---

## ✅ Testing Checklist

- [ ] Chat initializes on component mount
- [ ] Messages send and receive correctly
- [ ] Loading states display properly
- [ ] Error messages show when API fails
- [ ] Quick action buttons work
- [ ] Insights panel loads data
- [ ] Mobile responsive design works
- [ ] Keyboard shortcuts (Enter to send)
- [ ] Token refresh on 401 errors
- [ ] Rate limiting handled gracefully

---

## 📚 Additional Resources

- Backend API Documentation: `COMPLETE_FIX_SUMMARY.md`
- AI Architecture: `AI_ARCHITECTURE.md`
- Testing Guide: `TEST_FIXES.md`
- Setup Guide: `START_GUIDE.md`

---

**Ready to integrate! All systems operational ✅**
