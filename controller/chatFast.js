/**
 * Fast AI Chat Controller
 * Optimized for speed - uses exact dashboard data
 */
import OpenAI from 'openai';
import { dashboard } from './profitfirst/dashboard.js';
import predictionService from '../services/predictionService.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory session storage (use Redis in production)
const sessions = new Map();

/**
 * Extract business data from dashboard response
 */
function extractBusinessData(dashboardResponse) {
  const summary = dashboardResponse.summary || [];
  
  const getValue = (title) => {
    const item = summary.find(s => s.title === title);
    if (!item) return 0;
    const value = item.value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[₹,]/g, '').replace(/%/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return typeof value === 'number' ? value : 0;
  };

  const shipping = dashboardResponse.shipping || [];
  
  return {
    revenue: getValue('Revenue'),
    orders: getValue('Total Orders'),
    aov: getValue('Avg. Order Value'),
    cogs: getValue('COGS'),
    grossProfit: getValue('Gross Profit'),
    adSpend: getValue('Ads Spend'),
    shippingCost: getValue('Shipping Cost'),
    netProfit: getValue('Net Profit'),
    roas: getValue('ROAS'),
    grossProfitMargin: getValue('Gross Profit Margin'),
    netProfitMargin: getValue('Net Profit Margin'),
    totalShipments: shipping.length,
    delivered: shipping.filter(s => s.status?.toLowerCase().includes('delivered')).length,
    inTransit: shipping.filter(s => s.status?.toLowerCase().includes('in-transit') || s.status?.toLowerCase().includes('in transit')).length,
    rto: shipping.filter(s => s.status?.toLowerCase().includes('rto')).length,
    ndr: shipping.filter(s => s.status?.toLowerCase().includes('ndr')).length,
  };
}

/**
 * Initialize fast chat session
 */
export async function initFastChat(req, res) {
  try {
    const { user } = req;
    const sessionId = `${user._id}_${Date.now()}`;

    console.log(`[FAST-AI] ⚡ Initializing for user ${user._id}...`);
    const startTime = Date.now();

    // Get dashboard data (same as what user sees)
    let dashboardData = null;
    const mockReq = { user, query: {} };
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          dashboardData = data;
          return mockRes;
        }
      })
    };

    await dashboard(mockReq, mockRes);
    
    if (!dashboardData) {
      throw new Error('Failed to fetch dashboard data');
    }

    // Extract business metrics
    const businessData = extractBusinessData(dashboardData);
    
    console.log(`[FAST-AI] ⚡ Data loaded in ${Date.now() - startTime}ms`);
    console.log(`[FAST-AI] 📊 Revenue: ₹${businessData.revenue.toLocaleString('en-IN')}, Orders: ${businessData.orders}`);

    // Store in session
    sessions.set(sessionId, {
      userId: user._id,
      businessData,
      dashboardData, // Store full dashboard data for reference
      createdAt: Date.now(),
      messages: [],
    });

    // Clean old sessions (older than 1 hour)
    for (const [key, value] of sessions.entries()) {
      if (Date.now() - value.createdAt > 3600000) {
        sessions.delete(key);
      }
    }

    res.json({
      success: true,
      sessionId,
      message: '👋 Hi! I\'m your Profit First AI assistant. Ask me anything about your business metrics!',
    });
  } catch (error) {
    console.error('[FAST-AI] ❌ Init error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize chat',
    });
  }
}

/**
 * Send message - fast response
 */
export async function sendFastMessage(req, res) {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId or message',
      });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired',
      });
    }

    console.log(`[FAST-AI] ⚡ Processing: "${message}"`);
    const startTime = Date.now();

    const { businessData, dashboardData } = session;

    // Format business data for AI
    const formatINR = (num) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num || 0);
    };

    // Generate predictions
    const forecast = predictionService.generateForecast(businessData);

    // Get exact values from dashboard summary
    const summary = dashboardData.summary || [];
    const getDisplayValue = (title) => {
      const item = summary.find(s => s.title === title);
      return item ? item.value : 'N/A';
    };

    // Build concise context with EXACT dashboard values
    const context = `
EXACT BUSINESS METRICS (From Dashboard - Last 30 Days):

SUMMARY:
- Total Orders: ${getDisplayValue('Total Orders')}
- Revenue: ${getDisplayValue('Revenue')}
- COGS: ${getDisplayValue('COGS')}
- Gross Profit: ${getDisplayValue('Gross Profit')}
- Net Profit: ${getDisplayValue('Net Profit')}
- Ads Spend: ${getDisplayValue('Ads Spend')}
- Shipping Cost: ${getDisplayValue('Shipping Cost')}
- Avg. Order Value: ${getDisplayValue('Avg. Order Value')}
- ROAS: ${getDisplayValue('ROAS')}
- Gross Profit Margin: ${getDisplayValue('Gross Profit Margin')}
- Net Profit Margin: ${getDisplayValue('Net Profit Margin')}
- POAS: ${getDisplayValue('POAS')}

SHIPPING STATUS:
- Total Shipments: ${businessData.totalShipments}
- Delivered: ${businessData.delivered}
- In-Transit: ${businessData.inTransit}
- RTO: ${businessData.rto}
- NDR: ${businessData.ndr}

PROJECTIONS (Based on current data):
- Monthly Revenue: ${formatINR(forecast.revenue.monthly)}
- Monthly Profit: ${formatINR(forecast.profit.monthly)}
- Break-even Orders: ${forecast.breakEven.breakEvenOrders}
- Orders Above Break-even: ${forecast.breakEven.ordersAboveBreakeven}
`;

    // Add to conversation history (keep last 6 messages)
    session.messages.push({ role: 'user', content: message });
    if (session.messages.length > 6) {
      session.messages = session.messages.slice(-6);
    }

    // Call OpenAI with timeout protection
    const completionPromise = openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are Profit First AI - a helpful business analytics assistant for Indian D2C brands.

${context}

🔴 CRITICAL INSTRUCTIONS:
1. Use ONLY the EXACT values shown in "EXACT BUSINESS METRICS" above
2. Copy the values EXACTLY as shown (including ₹ symbol and formatting)
3. DO NOT calculate or modify any numbers
4. DO NOT add or subtract values
5. If asked about a metric, quote it EXACTLY from the summary

RESPONSE RULES:
- Be concise (2-3 sentences maximum)
- Be conversational and friendly
- Answer every question confidently
- For past questions: Use the exact values from summary
- For future questions: Use projections section
- Never say "I don't have data"

EXAMPLES OF CORRECT RESPONSES:

Q: "What's my revenue?"
A: "Your revenue is ${getDisplayValue('Revenue')} from ${getDisplayValue('Total Orders')} orders. That's an average of ${getDisplayValue('Avg. Order Value')} per order."

Q: "What's my total revenue?"
A: "Your total revenue is ${getDisplayValue('Revenue')} over the last 30 days."

Q: "How many orders?"
A: "You have ${getDisplayValue('Total Orders')} orders."

Q: "What's my profit?"
A: "Your net profit is ${getDisplayValue('Net Profit')} with a ${getDisplayValue('Net Profit Margin')} margin."

Q: "What's my gross profit?"
A: "Your gross profit is ${getDisplayValue('Gross Profit')} with a ${getDisplayValue('Gross Profit Margin')} margin."

Q: "How's my ROAS?"
A: "Your ROAS is ${getDisplayValue('ROAS')}, which means you're making ₹${businessData.roas?.toFixed(2) || 0} for every ₹1 spent on ads. ${businessData.roas > 3 ? 'That\'s excellent!' : 'There\'s room for improvement.'}"

Q: "What are my shipping costs?"
A: "Your shipping cost is ${getDisplayValue('Shipping Cost')} with ${businessData.totalShipments} total shipments. ${businessData.delivered} delivered, ${businessData.rto} RTO."

🔴 REMEMBER: Always use the EXACT values from the summary above. Never calculate!`,
        },
        ...session.messages,
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OpenAI request timeout')), 10000)
    );

    const completion = await Promise.race([completionPromise, timeoutPromise]);

    const reply = completion.choices[0].message.content;

    // Add to history
    session.messages.push({ role: 'assistant', content: reply });

    console.log(`[FAST-AI] ⚡ Response generated in ${Date.now() - startTime}ms`);

    res.json({
      success: true,
      reply,
      responseTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error('[FAST-AI] ❌ Message error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      reply: 'I apologize, but I encountered an error. Please try again.',
    });
  }
}

export default {
  initFastChat,
  sendFastMessage,
};
