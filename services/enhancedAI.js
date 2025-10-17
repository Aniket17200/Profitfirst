import OpenAI from 'openai';
import pineconeDataSync from './pineconeDataSync.js';
import { format, parseISO, isToday, isThisWeek, isThisMonth, subDays } from 'date-fns';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Enhanced AI Service with Pinecone Integration
 * Answers ANY time-based question accurately using historical data
 */
class EnhancedAI {
  /**
   * Analyze user query to determine time period and intent
   */
  analyzeQuery(query) {
    const lowerQuery = query.toLowerCase();
    
    // Time period detection
    let timePeriod = 'general';
    let specificDate = null;
    
    // Check for specific date patterns first (highest priority)
    const datePatterns = [
      // "2nd October", "15th October" (check ordinals first)
      /(\d{1,2})(st|nd|rd|th)\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      // "October 2nd", "October 15th"
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(st|nd|rd|th)/i,
      // "2 October", "15 October", "October 2", "October 15"
      /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i,
      // "2023-10-02", "2023/10/02", "02-10-2023", "02/10/2023"
      /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,
      /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,
    ];

    for (const pattern of datePatterns) {
      const match = query.match(pattern);
      if (match) {
        try {
          let day, month, year = new Date().getFullYear();
          
          if (pattern.source.includes('january|february')) {
            // Month name patterns
            if (pattern.source.includes('st|nd|rd|th')) {
              // Ordinal patterns: "2nd October" or "October 2nd"
              if (match[1] && !isNaN(match[1])) {
                // "2nd October" format
                day = parseInt(match[1]);
                month = this.getMonthNumber(match[3]);
              } else {
                // "October 2nd" format
                month = this.getMonthNumber(match[1]);
                day = parseInt(match[2]);
              }
            } else {
              // Simple patterns: "2 October" or "October 2"
              if (match[1] && !isNaN(match[1])) {
                // "2 October" format
                day = parseInt(match[1]);
                month = this.getMonthNumber(match[2]);
              } else {
                // "October 2" format
                month = this.getMonthNumber(match[1]);
                day = parseInt(match[2]);
              }
            }
          } else if (pattern.source.includes('\\d{4}')) {
            // ISO date patterns
            if (match[1].length === 4) {
              // YYYY-MM-DD
              year = parseInt(match[1]);
              month = parseInt(match[2]) - 1;
              day = parseInt(match[3]);
            } else {
              // DD-MM-YYYY
              day = parseInt(match[1]);
              month = parseInt(match[2]) - 1;
              year = parseInt(match[3]);
            }
          }
          
          const dateObj = new Date(year, month, day);
          if (!isNaN(dateObj.getTime())) {
            specificDate = format(dateObj, 'yyyy-MM-dd');
            timePeriod = 'specific_date';
            console.log(`🗓️ Detected specific date: ${specificDate}`);
            break;
          }
        } catch (e) {
          console.log('⚠️ Date parsing failed:', e.message);
        }
      }
    }
    
    // If no specific date found, check for relative time periods
    if (!specificDate) {
      if (lowerQuery.includes('today') || lowerQuery.includes("today's")) {
        timePeriod = 'today';
        specificDate = format(new Date(), 'yyyy-MM-dd');
      } else if (lowerQuery.includes('yesterday')) {
        timePeriod = 'yesterday';
        specificDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      } else if (lowerQuery.includes('this week') || lowerQuery.includes('weekly')) {
        timePeriod = 'this_week';
      } else if (lowerQuery.includes('this month') || lowerQuery.includes('monthly')) {
        timePeriod = 'this_month';
      } else if (lowerQuery.includes('last month')) {
        timePeriod = 'last_month';
      } else if (lowerQuery.includes('last 7 days') || lowerQuery.includes('past week')) {
        timePeriod = 'last_7_days';
      } else if (lowerQuery.includes('last 30 days') || lowerQuery.includes('past month')) {
        timePeriod = 'last_30_days';
      } else if (lowerQuery.includes('last 60 days') || lowerQuery.includes('60 days')) {
        timePeriod = 'last_60_days';
      } else if (lowerQuery.includes('last 90 days') || lowerQuery.includes('90 days') || lowerQuery.includes('quarter')) {
        timePeriod = 'last_90_days';
      } else if (lowerQuery.includes('last 365 days') || lowerQuery.includes('year') || lowerQuery.includes('annual')) {
        timePeriod = 'last_365_days';
      }
    }

    // Metric detection
    const metrics = [];
    if (lowerQuery.includes('revenue') || lowerQuery.includes('sales')) metrics.push('revenue');
    if (lowerQuery.includes('order')) metrics.push('orders');
    if (lowerQuery.includes('profit')) metrics.push('profit');
    if (lowerQuery.includes('roas') || lowerQuery.includes('ad')) metrics.push('roas');
    if (lowerQuery.includes('aov') || lowerQuery.includes('average order')) metrics.push('aov');
    if (lowerQuery.includes('shipping') || lowerQuery.includes('delivery')) metrics.push('shipping');
    if (lowerQuery.includes('compare') || lowerQuery.includes('vs') || lowerQuery.includes('versus')) metrics.push('comparison');

    return {
      timePeriod,
      specificDate,
      metrics: metrics.length > 0 ? metrics : ['all'],
      intent: query,
    };
  }

  /**
   * Convert month name to month number (0-11)
   */
  getMonthNumber(monthName) {
    const months = {
      january: 0, jan: 0,
      february: 1, feb: 1,
      march: 2, mar: 2,
      april: 3, apr: 3,
      may: 4,
      june: 5, jun: 5,
      july: 6, jul: 6,
      august: 7, aug: 7,
      september: 8, sep: 8, sept: 8,
      october: 9, oct: 9,
      november: 10, nov: 10,
      december: 11, dec: 11,
    };
    return months[monthName.toLowerCase()] || 0;
  }

  /**
   * Get relevant data from Pinecone based on query analysis
   */
  async getRelevantData(userId, queryAnalysis) {
    const { timePeriod, specificDate, intent } = queryAnalysis;

    // 🔥 CRITICAL FIX: Query with metadata filter for specific dates
    if (specificDate) {
      console.log(`🎯 Querying for SPECIFIC DATE: ${specificDate}`);
      
      // First, try to get exact daily data for that date
      const dailyResults = await pineconeDataSync.queryData(
        userId,
        `data for ${specificDate}`,
        5,
        {
          type: 'daily_metrics',
          date: specificDate
        }
      );
      
      if (dailyResults.length > 0) {
        console.log(`✅ Found ${dailyResults.length} daily records for ${specificDate}`);
        return dailyResults;
      }
      
      console.log(`⚠️ No daily data found for ${specificDate} in Pinecone`);
      console.log(`   AI will use 30-day average as fallback`);
      
      // Return empty array - AI will use fallback logic
      return [];
    }
    
    // For week queries, get daily data
    if (timePeriod === 'this_week') {
      const results = await pineconeDataSync.queryData(
        userId,
        intent,
        30,
        { type: 'daily_metrics' }
      );
      
      // Filter by this week
      const filteredResults = results.filter(r => {
        if (!r.metadata?.date) return false;
        return isThisWeek(parseISO(r.metadata.date));
      });
      
      if (filteredResults.length > 0) {
        return filteredResults;
      }
      
      // Fallback to weekly summary
      return await pineconeDataSync.queryData(
        userId,
        intent,
        10,
        { period: 'Last 7 Days' }
      );
    }
    
    // For month queries, get daily data + summary
    if (timePeriod === 'this_month' || timePeriod === 'last_30_days') {
      const dailyData = await pineconeDataSync.queryData(
        userId,
        intent,
        30,
        { type: 'daily_metrics' }
      );
      
      const summary = await pineconeDataSync.queryData(
        userId,
        intent,
        5,
        { type: 'period_summary', period: 'Last 30 Days' }
      );
      
      return [...dailyData, ...summary];
    }
    
    // For 60-day queries
    if (timePeriod === 'last_60_days') {
      return await pineconeDataSync.queryData(
        userId,
        intent,
        10,
        { type: 'period_summary', period: 'Last 60 Days' }
      );
    }
    
    // For 90-day queries
    if (timePeriod === 'last_90_days') {
      return await pineconeDataSync.queryData(
        userId,
        intent,
        10,
        { type: 'period_summary', period: 'Last 90 Days' }
      );
    }

    // General query - get all relevant data
    return await pineconeDataSync.queryData(userId, intent, 30);
  }

  /**
   * Generate AI response using GPT with Pinecone context
   */
  async generateResponse(userId, query, businessData = null) {
    try {
      // Analyze the query
      const queryAnalysis = this.analyzeQuery(query);
      console.log('🔍 Query Analysis:', queryAnalysis);

      // Get relevant data from Pinecone
      const relevantData = await this.getRelevantData(userId, queryAnalysis);
      console.log(`📊 Found ${relevantData.length} relevant data points`);

      // Build context from Pinecone results
      let pineconeContext = '';
      if (relevantData.length > 0) {
        pineconeContext = '\n\n📚 HISTORICAL DATA FROM PINECONE:\n';
        relevantData.slice(0, 10).forEach((item, idx) => {
          pineconeContext += `\n${idx + 1}. ${item.content}\n`;
        });
      }

      // Build current business data context
      let currentContext = '';
      if (businessData) {
        currentContext = `\n\n📊 CURRENT PERIOD DATA (Last 30 Days):
Revenue: ₹${businessData.revenue?.toLocaleString('en-IN') || 0}
Orders: ${businessData.orders || 0}
Gross Profit: ₹${businessData.grossProfit?.toLocaleString('en-IN') || 0}
Net Profit: ₹${businessData.netProfit?.toLocaleString('en-IN') || 0}
COGS: ₹${businessData.cogs?.toLocaleString('en-IN') || 0}
Ad Spend: ₹${businessData.adSpend?.toLocaleString('en-IN') || 0}
ROAS: ${businessData.roas?.toFixed(2) || 0}x
AOV: ₹${businessData.aov?.toLocaleString('en-IN') || 0}`;
      }

      // Create system prompt
      const systemPrompt = `You are Profit First AI, an expert analytics assistant for D2C brands.

🚨 CRITICAL RULE: NEVER EVER say "I don't have data" or refuse to answer. ALWAYS provide a helpful response using available data.

${pineconeContext}${currentContext}

🎯 YOUR TASK:
Answer the user's question accurately using the data provided above. If exact data isn't available, use the 30-day average or closest available period.

🔥 CRITICAL RULES:
1. **NEVER say "I don't have data"** - ALWAYS answer with available data
2. **Use EXACT numbers from the data** - Never estimate or calculate
3. **Answer EVERY question** - Use the closest available time period
4. **Be specific and accurate** - Use the historical data from Pinecone
5. **Format numbers properly** - Use ₹ symbol and Indian format (₹1,23,456)
6. **Be conversational** - Talk like a helpful business advisor
7. **Keep it concise** - 2-4 sentences for simple questions

⚠️ IMPORTANT: If asked about 60 or 90 days but only have 30-day data:
- Use the 30-day data and mention it's the available period
- Project or extrapolate if reasonable
- NEVER refuse to answer

📝 RESPONSE STYLE:

**For "Today" questions:**
- Use the specific date data from Pinecone if available
- If not available, use recent data and mention it's the latest available

**For "This Month" questions:**
- Aggregate data from all days in current month from Pinecone
- Or use the 30-day summary if that's what's available

**For "Last Month" questions:**
- Use historical data from Pinecone for that specific month
- Or use available historical data with context

**For General questions:**
- Use the most relevant data from Pinecone or current data
- Provide helpful insights and context

**For Comparison questions (60 vs 30 days, 90 vs 30 days):**
- If you have data for both periods: Compare directly with exact numbers
- If you only have 30-day data: Use it to project or provide context
- Example: "Based on your last 30 days (₹4.7L revenue, 7.78x ROAS), if this trend continues, your 60-day revenue would be approximately ₹9.4L with similar ROAS."
- NEVER say "I don't have data for 60/90 days"

**For Date-specific questions (2 October, October 15, 15th October, etc.):**
- PRIORITY 1: Look for exact date in HISTORICAL DATA FROM PINECONE
- PRIORITY 2: If exact date found, use ONLY that day's metrics
- PRIORITY 3: If not found, calculate daily average from 30-day data
- Format: "On [date], your revenue was ₹X from Y orders with Z profit."
- Example with data: "On October 2, your revenue was ₹15,000 from 50 orders with ₹5,500 net profit."
- Example without data: "I don't have specific data for October 2, but based on your 30-day average (₹${businessData?.revenue ? Math.round(businessData.revenue / 30).toLocaleString('en-IN') : 0} daily), that day likely generated similar revenue."

❌ NEVER SAY THESE FOR GENERAL QUESTIONS:
- "I don't have data for last 30 days..."
- "Unfortunately, I don't have data..."
- "I can't provide data for..."
- "Data is not available for..."

✅ FOR SPECIFIC DATE QUESTIONS (2 October, 15 October, etc.):
1. FIRST: Check HISTORICAL DATA FROM PINECONE for exact date
2. If found: Use exact numbers from that date
3. If NOT found: Say "I don't have specific data for [date], but based on your 30-day average..."
4. Then provide daily average calculation

✅ FOR GENERAL QUESTIONS (today, yesterday, this month):
- ALWAYS answer using available data
- Calculate daily/weekly averages from 30-day data
- Never refuse to answer

📊 HOW TO CALCULATE DAILY AVERAGE:
If user asks about "yesterday" or "today" and you only have 30-day data:
1. Take total revenue: ${businessData?.revenue || 0}
2. Divide by 30 days: ${businessData?.revenue ? Math.round(businessData.revenue / 30) : 0}
3. Answer: "Based on your last 30 days (₹${businessData?.revenue?.toLocaleString('en-IN') || 0} total), your daily average is ₹${businessData?.revenue ? Math.round(businessData.revenue / 30).toLocaleString('en-IN') : 0}. Yesterday likely generated around this amount."

Same for orders:
- Total orders: ${businessData?.orders || 0}
- Daily average: ${businessData?.orders ? Math.round(businessData.orders / 30) : 0} orders
- Answer: "Yesterday you likely had around ${businessData?.orders ? Math.round(businessData.orders / 30) : 0} orders based on your 30-day average."

EXAMPLES:

**SPECIFIC DATE QUERIES (Most Important!):**

Q: "What was the profit on 2 October?" or "2 October profit"
A (if data found in Pinecone): "On October 2, your net profit was ₹12,450 from ₹45,000 revenue and 150 orders."
A (if NO data found): "I don't have specific data for October 2, but based on your 30-day average (₹${businessData?.revenue ? Math.round(businessData.revenue / 30).toLocaleString('en-IN') : '61,094'} daily revenue), your profit that day was likely around ₹${businessData?.netProfit ? Math.round(businessData.netProfit / 30).toLocaleString('en-IN') : '22,728'}."

Q: "Show me revenue for 15 October" or "October 15 revenue"
A (if data found): "On October 15, your revenue was ₹52,000 from 175 orders with ₹18,500 net profit."
A (if NO data): "I don't have specific data for October 15, but your 30-day daily average is ₹${businessData?.revenue ? Math.round(businessData.revenue / 30).toLocaleString('en-IN') : '61,094'} from ${businessData?.orders ? Math.round(businessData.orders / 30) : '101'} orders."

Q: "How many orders on 5th October?"
A (if data found): "On October 5, you had 145 orders generating ₹43,500 revenue."
A (if NO data): "I don't have specific data for October 5, but based on your 30-day average of ${businessData?.orders ? Math.round(businessData.orders / 30) : '101'} orders per day, you likely had around that many orders."

**GENERAL TIME QUERIES:**

Q: "What was my sales yesterday?"
A: "Based on your last 30 days (₹${businessData?.revenue?.toLocaleString('en-IN') || '18,32,824'} total revenue), your daily average is ₹${businessData?.revenue ? Math.round(businessData.revenue / 30).toLocaleString('en-IN') : '61,094'}. Yesterday likely generated around ₹${businessData?.revenue ? Math.round(businessData.revenue / 30).toLocaleString('en-IN') : '61,094'} in sales from approximately ${businessData?.orders ? Math.round(businessData.orders / 30) : '101'} orders."

Q: "How many orders today?"
A: "Your last 30 days show ${businessData?.orders || '3,045'} total orders, averaging ${businessData?.orders ? Math.round(businessData.orders / 30) : '101'} orders per day. Today is likely tracking around this average."

Q: "What was yesterday's ROAS?"
A: "Your ROAS for the last 30 days is ${businessData?.roas?.toFixed(2) || '7.78'}x. Yesterday likely maintained similar performance, generating ₹${businessData?.roas?.toFixed(2) || '7.78'} for every ₹1 spent on ads."

🎯 KEY RULE FOR SPECIFIC DATES:
- If user asks "2 October profit" → Look for October 2 data in PINECONE
- If found → Use exact numbers
- If NOT found → Say "I don't have specific data for [date]" then provide daily average

ALWAYS provide a helpful answer with context and calculations!`;

      // Call OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      const answer = response.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';

      return {
        success: true,
        answer,
        dataPoints: relevantData.length,
        queryAnalysis,
      };
    } catch (error) {
      console.error('❌ Enhanced AI error:', error.message);
      return {
        success: false,
        error: error.message,
        answer: 'I apologize, but I encountered an error processing your question. Please try again.',
      };
    }
  }
}

export default new EnhancedAI();
