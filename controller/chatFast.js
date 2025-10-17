/**
 * Fast AI Chat Controller
 * Optimized for speed - uses exact dashboard data
 */
import OpenAI from 'openai';
import { dashboard } from './profitfirst/dashboard.js';
import predictionService from '../services/predictionService.js';
import { analyzeQuery, formatDateForDisplay } from '../utils/dateParser.js';

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
    
    // Analyze query for date-specific requests
    const queryAnalysis = analyzeQuery(message);
    console.log(`[FAST-AI] 🔍 Query analysis:`, queryAnalysis);

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
6. The data above covers the LAST 30 DAYS period

⏰ TIME-BASED QUESTIONS - HOW TO ANSWER:

When user asks about "TODAY" or "THIS MONTH" or "PAST" or any time period:
- The data I have is for the LAST 30 DAYS
- Answer with the 30-day data and clarify the time period
- NEVER say "I don't have data for today"
- ALWAYS provide the available data

EXAMPLES:

**SPECIFIC DATE QUERIES (MOST IMPORTANT!):**

Q: "What was the profit on 2 October?" or "2 October profit"
A: "I don't have specific data for October 2, but based on your last 30 days (${getDisplayValue('Net Profit')} total), your daily average profit is ${formatINR(businessData.netProfit / 30)}. October 2 likely generated around this amount."

Q: "Show me revenue for 15 October" or "October 15 revenue"
A: "I don't have specific data for October 15, but your 30-day daily average is ${formatINR(businessData.revenue / 30)} from ${Math.round(businessData.orders / 30)} orders. October 15 likely had similar performance."

Q: "How many orders on 5th October?"
A: "I don't have specific data for October 5, but based on your 30-day average of ${Math.round(businessData.orders / 30)} orders per day, you likely had around that many orders."

**GENERAL TIME QUERIES:**

Q: "What are today's orders?" or "Show me today's orders"
A: "Based on the last 30 days, you have ${getDisplayValue('Total Orders')} total orders with revenue of ${getDisplayValue('Revenue')}. Your average is about ${Math.round(businessData.orders / 30)} orders per day."

Q: "How many orders today?"
A: "Over the last 30 days, you have ${getDisplayValue('Total Orders')} orders, averaging ${Math.round(businessData.orders / 30)} orders daily."

Q: "What's today's revenue?"
A: "Your revenue for the last 30 days is ${getDisplayValue('Revenue')}, which averages ${formatINR(businessData.revenue / 30)} per day."

Q: "Show me this month's profit"
A: "For the last 30 days, your net profit is ${getDisplayValue('Net Profit')} with a ${getDisplayValue('Net Profit Margin')} margin."

Q: "What was last month's revenue?"
A: "Based on the last 30 days, your revenue is ${getDisplayValue('Revenue')} from ${getDisplayValue('Total Orders')} orders."

Q: "Compare this month vs last month"
A: "I have your last 30 days showing ${getDisplayValue('Revenue')} revenue with ${getDisplayValue('Total Orders')} orders. Your ${getDisplayValue('Net Profit Margin')} profit margin is ${businessData.netProfitMargin > 30 ? 'strong' : 'moderate'}."

Q: "What's the revenue for the past week?"
A: "Based on the last 30 days (${getDisplayValue('Revenue')}), your weekly average would be approximately ${formatINR(businessData.revenue / 4.3)}."

STANDARD QUESTIONS:

Q: "What's my revenue?"
A: "Your revenue is ${getDisplayValue('Revenue')} from ${getDisplayValue('Total Orders')} orders over the last 30 days."

Q: "How many orders?"
A: "You have ${getDisplayValue('Total Orders')} orders in the last 30 days."

Q: "What's my profit?"
A: "Your net profit is ${getDisplayValue('Net Profit')} with a ${getDisplayValue('Net Profit Margin')} margin."

Q: "What's my gross profit?"
A: "Your gross profit is ${getDisplayValue('Gross Profit')} with a ${getDisplayValue('Gross Profit Margin')} margin."

Q: "How's my ROAS?"
A: "Your ROAS is ${getDisplayValue('ROAS')}, which means you're making ₹${businessData.roas?.toFixed(2) || 0} for every ₹1 spent on ads. ${businessData.roas > 3 ? 'That\'s excellent!' : 'There\'s room for improvement.'}"

Q: "What are my shipping costs?"
A: "Your shipping cost is ${getDisplayValue('Shipping Cost')} with ${businessData.totalShipments} total shipments. ${businessData.delivered} delivered, ${businessData.rto} RTO."

RESPONSE RULES:
- Be concise (2-3 sentences maximum)
- Be conversational and friendly
- Answer EVERY question confidently - never refuse
- For time-based questions: Use 30-day data and provide daily/weekly averages
- For SPECIFIC DATE questions: Acknowledge no daily data, then provide daily average
- Never say "I don't have data for that period" without providing an estimate
- Always provide helpful context

🔴 REMEMBER: 
- Data is for LAST 30 DAYS
- Always answer time-based questions using this data
- For specific dates (2 October, October 15): Say "I don't have specific data for [date], but..." then provide daily average
- Provide daily/weekly averages when asked about shorter periods
- Use EXACT values from summary - never calculate!

${queryAnalysis.dateDetected ? `
🎯 SPECIAL INSTRUCTION FOR THIS QUERY:
The user asked about a SPECIFIC DATE: ${formatDateForDisplay(queryAnalysis.specificDate)}
You MUST respond with:
1. "I don't have specific data for ${formatDateForDisplay(queryAnalysis.specificDate)}, but..."
2. Then provide the daily average from the 30-day data
3. Example: "I don't have specific data for ${formatDateForDisplay(queryAnalysis.specificDate)}, but based on your last 30 days (${getDisplayValue('Net Profit')} total profit), your daily average is ${formatINR(businessData.netProfit / 30)}. That date likely generated around this amount."
` : ''}`,
        },
        ...session.messages,
      ],
      temperature: 0.1,
      max_tokens: 250,
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
