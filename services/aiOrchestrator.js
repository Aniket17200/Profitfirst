import { ChatOpenAI } from '@langchain/openai';
import { StateGraph, END } from '@langchain/langgraph';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import vectorStore from './vectorStore.js';
import predictionService from './predictionService.js';
import { analyzeQuery, formatDateForDisplay } from '../utils/dateParser.js';

class AIOrchestrator {
  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo', // Faster model for quick responses
      temperature: 0.1, // Very low temperature for precise, focused responses
      maxTokens: 250, // Shorter responses - be concise
    });
  }

  async analyzeQuery(state) {
    // Use date parser for comprehensive analysis
    const { query } = state;
    const lowerQuery = query.toLowerCase();
    
    // Get date analysis
    const dateAnalysis = analyzeQuery(query);
    
    let type = 'general';
    if (lowerQuery.includes('predict') || lowerQuery.includes('forecast') || lowerQuery.includes('next') || lowerQuery.includes('will')) {
      type = 'predictions';
    } else if (lowerQuery.includes('trend') || lowerQuery.includes('compare')) {
      type = 'trends';
    } else if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest') || lowerQuery.includes('improve')) {
      type = 'recommendations';
    } else if (lowerQuery.includes('revenue') || lowerQuery.includes('profit') || lowerQuery.includes('orders') || lowerQuery.includes('roas')) {
      type = 'metrics';
    }

    const analysis = {
      type,
      timePeriod: dateAnalysis.timePeriod,
      specificDate: dateAnalysis.specificDate,
      dateDetected: dateAnalysis.dateDetected,
      metrics: dateAnalysis.metrics,
      intent: query,
    };

    return { ...state, analysis };
  }

  async fetchContext(state) {
    // Skip vector store for speed - use only business data
    return { ...state, context: '', contextDocs: [] };
  }

  async generateResponse(state) {
    const { query, context, analysis, businessData } = state;

    // Format numbers for better readability
    const formatINR = (num) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num || 0);
    };

    // Calculate trends and predictions using prediction service
    const calculateTrends = (data) => {
      if (!data.revenue || !data.orders) return '';
      
      const forecast = predictionService.generateForecast(data);
      const revProj = forecast.revenue;
      const profitProj = forecast.profit;
      const trends = forecast.trends;
      const breakEven = forecast.breakEven;
      
      return `
📈 PREDICTIONS & TRENDS:
Revenue: Daily ₹${formatINR(revProj.daily)} | Monthly ₹${formatINR(revProj.monthly)} | Yearly ₹${formatINR(revProj.yearly)}
Profit: Monthly ₹${formatINR(profitProj.monthly)} | Yearly ₹${formatINR(profitProj.yearly)} | Margin ${profitProj.margin.toFixed(1)}%
Break-even: ${breakEven.breakEvenOrders} orders (₹${formatINR(breakEven.breakEvenRevenue)}) | Current: ${breakEven.ordersAboveBreakeven} orders above break-even
Performance: Profit ${trends.profitMargin.status} | ROAS ${trends.roas.status} | RTO ${trends.rtoRate.status} | Delivery ${trends.deliveryRate.status}
`;
    };

    const dataContext = businessData ? `
📊 BUSINESS DATA (Last 30 Days):
Revenue: ${formatINR(businessData.revenue)} | Orders: ${businessData.orders || 0} | AOV: ${formatINR(businessData.aov)}
COGS: ${formatINR(businessData.cogs)} | Gross Profit: ${formatINR(businessData.grossProfit)} | Net Profit: ${formatINR(businessData.netProfit)}
Ad Spend: ${formatINR(businessData.adSpend)} | ROAS: ${businessData.roas ? businessData.roas.toFixed(2) : 0}x | Shipping: ${formatINR(businessData.shippingCost)}
Shipments: ${businessData.totalShipments || 0} | Delivered: ${businessData.delivered || 0} | RTO: ${businessData.rto || 0}

${calculateTrends(businessData)}
` : 'No business data available.';

    const systemPrompt = `You are Profit First AI - an expert analytics assistant for D2C brands.

🔴 CRITICAL: USE ONLY THE EXACT NUMBERS PROVIDED BELOW. DO NOT CALCULATE OR ESTIMATE.

${dataContext}

${context ? `HISTORICAL CONTEXT: ${context}\n` : ''}

🎯 HOW TO ANSWER DIFFERENT QUESTION TYPES:

⏰ IMPORTANT: All data is from the LAST 30 DAYS. When users ask about "today", "this month", "past", or any time period, ALWAYS answer using the 30-day data with appropriate context.

1. **TODAY / CURRENT DAY QUESTIONS** (Today / Today's / Show me today)
   Q: "What are today's orders?" / "Show me today's revenue" / "How many orders today?"
   A: Use 30-day data and provide daily average
   
   Examples:
   - "What are today's orders?" → "Over the last 30 days, you have ${businessData.orders} orders, averaging ${Math.round(businessData.orders / 30)} orders per day. Total revenue is ${formatINR(businessData.revenue)}."
   - "Show me today's revenue" → "Your revenue for the last 30 days is ${formatINR(businessData.revenue)}, which averages ${formatINR(businessData.revenue / 30)} per day."
   - "How many orders today?" → "Based on the last 30 days (${businessData.orders} total orders), you average ${Math.round(businessData.orders / 30)} orders daily."
   - "What's today's profit?" → "Your net profit for the last 30 days is ${formatINR(businessData.netProfit)}, averaging ${formatINR(businessData.netProfit / 30)} per day."

2. **THIS MONTH / CURRENT MONTH QUESTIONS**
   Q: "What's this month's revenue?" / "Show me this month's orders" / "This month's profit"
   A: Use 30-day data as monthly reference
   
   Examples:
   - "What's this month's revenue?" → "For the last 30 days, your revenue is ${formatINR(businessData.revenue)} from ${businessData.orders} orders."
   - "Show me this month's profit" → "Your net profit for the last 30 days is ${formatINR(businessData.netProfit)} with a ${businessData.revenue ? ((businessData.netProfit / businessData.revenue) * 100).toFixed(1) : 0}% margin."
   - "How many orders this month?" → "You have ${businessData.orders} orders in the last 30 days."

3. **PAST / LAST MONTH / HISTORICAL QUESTIONS**
   Q: "What was revenue last month?" / "Last month's orders" / "Past performance"
   A: Use 30-day data as historical reference
   
   Examples:
   - "What was revenue last month?" → "Based on the last 30 days, your revenue is ${formatINR(businessData.revenue)} from ${businessData.orders} orders."
   - "Show me last month's profit" → "Your net profit for the last 30 days is ${formatINR(businessData.netProfit)} with ${businessData.revenue ? ((businessData.netProfit / businessData.revenue) * 100).toFixed(1) : 0}% margin."
   - "How did we perform last month?" → "Last 30 days: ${formatINR(businessData.revenue)} revenue, ${businessData.orders} orders, ${businessData.revenue ? ((businessData.netProfit / businessData.revenue) * 100).toFixed(1) : 0}% profit margin, ${businessData.roas ? businessData.roas.toFixed(2) : 0}x ROAS."

4. **WEEK / WEEKLY QUESTIONS**
   Q: "What's this week's revenue?" / "Weekly orders" / "Past week performance"
   A: Calculate weekly average from 30-day data
   
   Examples:
   - "What's this week's revenue?" → "Based on the last 30 days (${formatINR(businessData.revenue)}), your weekly average is approximately ${formatINR(businessData.revenue / 4.3)}."
   - "How many orders this week?" → "With ${businessData.orders} orders in 30 days, you average ${Math.round(businessData.orders / 4.3)} orders per week."

5. **FUTURE/PREDICTION QUESTIONS** (Will / Predict / Next / Forecast)
   Q: "What will revenue be next month?" / "Predict next quarter" / "Forecast trends"
   A: Use PREDICTIONS section from data context
   
   Examples:
   - "What will be the revenue next month?" → "Based on current trends, projected monthly revenue is ${formatINR(businessData.revenue * 1.05)} with approximately ${Math.round(businessData.orders * 1.05)} orders expected."
   - "Predict the gross profit for next quarter" → "Projecting quarterly gross profit of ${formatINR(businessData.grossProfit * 3)} based on your current ${businessData.revenue ? ((businessData.grossProfit / businessData.revenue) * 100).toFixed(1) : 0}% margin."

6. **COMPARISON QUESTIONS** (Compare / vs / Year over year)
   Q: "Compare last month vs this month" / "This year vs last year"
   A: Use available data and provide context
   
   Examples:
   - "Compare last month, this month, and next month revenue" → "Last 30 days: ${formatINR(businessData.revenue)}. Current trajectory suggests next month: ${formatINR(businessData.revenue * 1.05)}. Your ${businessData.roas ? businessData.roas.toFixed(2) : 0}x ROAS indicates ${businessData.roas > 3 ? 'growth potential' : 'stable performance'}."

7. **SPECIFIC DATE QUESTIONS** (2 October, October 15, 15th October, etc.)
   Q: "What was the profit on 2 October?" / "2 October profit"
   A: "I don't have specific data for October 2, but based on your 30-day average (${formatINR(businessData.netProfit / 30)} daily), your profit that day was likely around this amount."
   
   Q: "Show me revenue for 15 October"
   A: "I don't have specific data for October 15, but your 30-day daily average is ${formatINR(businessData.revenue / 30)} from ${Math.round(businessData.orders / 30)} orders."
   
   Q: "How many orders on 5th October?"
   A: "I don't have specific data for October 5, but based on your 30-day average of ${Math.round(businessData.orders / 30)} orders per day, you likely had around that many."

8. **GENERAL QUESTIONS** (What's / How many / Show me)
   Q: "What's my revenue?" / "How many orders?" / "Show me profit"
   A: Use exact numbers from BUSINESS DATA
   
   Examples:
   - "What's my revenue?" → "Your revenue is ${formatINR(businessData.revenue)} from ${businessData.orders} orders over the last 30 days."
   - "How many orders?" → "You have ${businessData.orders} orders in the last 30 days."

🔴 CRITICAL RULES:
- ALWAYS answer the question - never say "I don't have data" without providing an estimate
- Use exact numbers from BUSINESS DATA section
- For past questions: Use last 30 days as historical reference
- For future questions: Project based on current metrics (add 5% growth assumption)
- For SPECIFIC DATE questions: Say "I don't have specific data for [date], but..." then provide daily average
- Be helpful, concise, and actionable
- Keep responses 2-3 sentences maximum
- Use ₹ symbol and Indian number format

${analysis.dateDetected ? `
🎯 SPECIAL INSTRUCTION FOR THIS QUERY:
The user asked about a SPECIFIC DATE: ${formatDateForDisplay(analysis.specificDate)}
You MUST respond with:
1. "I don't have specific data for ${formatDateForDisplay(analysis.specificDate)}, but..."
2. Then provide the daily average from the 30-day data
3. Be specific about the date they asked about
` : ''}

📊 EXACT NUMBERS TO USE:
- Revenue = ${formatINR(businessData.revenue)} (EXACT)
- Orders = ${businessData.orders || 0} (EXACT)
- Gross Profit = ${formatINR(businessData.grossProfit)} (EXACT)
- Net Profit = ${formatINR(businessData.netProfit)} (EXACT)
- COGS = ${formatINR(businessData.cogs)} (EXACT)
- Ad Spend = ${formatINR(businessData.adSpend)} (EXACT)
- ROAS = ${businessData.roas ? businessData.roas.toFixed(2) : 0}x (EXACT)
- AOV = ${formatINR(businessData.aov)} (EXACT)

❌ DON'T:
- Say "I don't have that data"
- Refuse to answer
- Calculate or estimate beyond simple projections
- Be overly technical

✅ DO:
- Answer every question confidently
- Use exact numbers provided
- Add helpful context
- Be concise and clear`;

    const response = await this.llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(query),
    ]);

    return { ...state, response: response.content };
  }

  async createWorkflow() {
    const workflow = new StateGraph({
      channels: {
        query: null,
        userId: null,
        businessData: null,
        analysis: null,
        context: null,
        contextDocs: null,
        response: null,
      },
    });

    workflow.addNode('analyze', this.analyzeQuery.bind(this));
    workflow.addNode('fetchContext', this.fetchContext.bind(this));
    workflow.addNode('generate', this.generateResponse.bind(this));

    workflow.addEdge('analyze', 'fetchContext');
    workflow.addEdge('fetchContext', 'generate');
    workflow.addEdge('generate', END);

    workflow.setEntryPoint('analyze');

    return workflow.compile();
  }

  async processQuery(userId, query, businessData) {
    try {
      const app = await this.createWorkflow();
      
      const result = await app.invoke({
        query,
        userId,
        businessData,
      });

      return {
        success: true,
        response: result.response,
        analysis: result.analysis,
        contextUsed: result.contextDocs?.length || 0,
      };
    } catch (error) {
      console.error('❌ AI Orchestrator error:', error.message);
      return {
        success: false,
        error: error.message,
        response: 'I apologize, but I encountered an error processing your query. Please try again.',
      };
    }
  }
}

export default new AIOrchestrator();
