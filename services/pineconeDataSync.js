import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { format, parseISO } from 'date-fns';

/**
 * Comprehensive Pinecone Data Sync Service
 * Stores ALL business data (orders, revenue, metrics) by date for accurate AI responses
 */
class PineconeDataSync {
  constructor() {
    this.pinecone = null;
    this.index = null;
    this.embeddings = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });

      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'text-embedding-3-small',
      });

      const indexName = process.env.PINECONE_INDEX_NAME || 'profitfirst-analytics';
      this.index = this.pinecone.Index(indexName);
      
      this.initialized = true;
      console.log('✅ Pinecone Data Sync initialized');
    } catch (error) {
      console.error('❌ Pinecone initialization error:', error.message);
      throw error;
    }
  }

  /**
   * Store daily business data in Pinecone
   * @param {string} userId - User ID
   * @param {Array} dailyData - Array of daily metrics
   * @param {Object} summary - Summary metrics
   */
  async storeDailyData(userId, dailyData, summary) {
    try {
      await this.initialize();

      const documents = [];
      const vectors = [];

      // Store each day's data individually for precise queries
      for (const day of dailyData) {
        const date = day.date;
        const dateObj = parseISO(date);
        const formattedDate = format(dateObj, 'yyyy-MM-dd');
        const dayName = format(dateObj, 'EEEE');
        const monthName = format(dateObj, 'MMMM yyyy');

        // Create comprehensive text for embedding
        const content = `Date: ${formattedDate} (${dayName}, ${monthName})
Revenue: ₹${day.revenue?.toLocaleString('en-IN') || 0}
Orders: ${day.orders || 0}
Gross Profit: ₹${day.grossProfit?.toLocaleString('en-IN') || 0}
Net Profit: ₹${day.netProfit?.toLocaleString('en-IN') || 0}
COGS: ₹${day.cogs?.toLocaleString('en-IN') || 0}
Ad Spend: ₹${day.adSpend?.toLocaleString('en-IN') || 0}
Shipping Cost: ₹${day.shippingCost?.toLocaleString('en-IN') || 0}
ROAS: ${day.roas?.toFixed(2) || 0}x
AOV: ₹${day.aov?.toLocaleString('en-IN') || 0}
Shipments: ${day.shipments || 0}
Delivered: ${day.delivered || 0}
RTO: ${day.rto || 0}`;

        documents.push({
          content,
          metadata: {
            userId,
            type: 'daily_metrics',
            date: formattedDate,
            dayName,
            monthName,
            timestamp: dateObj.getTime(),
            ...day,
          },
        });
      }

      // Store period summary
      if (summary) {
        const summaryContent = `Business Summary (${summary.period || 'Last 30 Days'}):
Total Revenue: ₹${summary.totalRevenue?.toLocaleString('en-IN') || 0}
Total Orders: ${summary.totalOrders || 0}
Total Gross Profit: ₹${summary.totalGrossProfit?.toLocaleString('en-IN') || 0}
Total Net Profit: ₹${summary.totalNetProfit?.toLocaleString('en-IN') || 0}
Total COGS: ₹${summary.totalCOGS?.toLocaleString('en-IN') || 0}
Total Ad Spend: ₹${summary.totalAdSpend?.toLocaleString('en-IN') || 0}
Average Order Value: ₹${summary.avgOrderValue?.toLocaleString('en-IN') || 0}
ROAS: ${summary.totalROAS?.toFixed(2) || 0}x
Gross Margin: ${summary.grossMargin?.toFixed(2) || 0}%
Net Margin: ${summary.netMargin?.toFixed(2) || 0}%`;

        documents.push({
          content: summaryContent,
          metadata: {
            userId,
            type: 'period_summary',
            period: summary.period || 'Last 30 Days',
            timestamp: Date.now(),
            ...summary,
          },
        });
      }

      // Generate embeddings and store in Pinecone
      console.log(`📤 Storing ${documents.length} records in Pinecone...`);
      
      for (const doc of documents) {
        const embedding = await this.embeddings.embedQuery(doc.content);
        const id = `${userId}_${doc.metadata.type}_${doc.metadata.date || Date.now()}`;
        
        vectors.push({
          id,
          values: embedding,
          metadata: {
            ...doc.metadata,
            content: doc.content,
          },
        });
      }

      // Upsert in batches
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await this.index.upsert(batch);
      }

      console.log(`✅ Stored ${vectors.length} vectors in Pinecone for user ${userId}`);
      return { success: true, count: vectors.length };
    } catch (error) {
      console.error('❌ Error storing data in Pinecone:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Query Pinecone for relevant data based on user question
   * @param {string} userId - User ID
   * @param {string} query - User's question
   * @param {number} topK - Number of results to return
   * @param {Object} metadataFilter - Additional metadata filters
   */
  async queryData(userId, query, topK = 10, metadataFilter = {}) {
    try {
      await this.initialize();

      // Generate embedding for the query
      const queryEmbedding = await this.embeddings.embedQuery(query);

      // Build filter - combine userId with additional filters
      const filter = { userId, ...metadataFilter };

      // Search Pinecone
      const results = await this.index.query({
        vector: queryEmbedding,
        topK,
        filter,
        includeMetadata: true,
      });

      console.log(`🔍 Found ${results.matches?.length || 0} relevant records for query: "${query}"`);
      if (Object.keys(metadataFilter).length > 0) {
        console.log(`   Filters applied:`, metadataFilter);
      }

      return results.matches?.map(match => ({
        score: match.score,
        content: match.metadata?.content,
        metadata: match.metadata,
      })) || [];
    } catch (error) {
      console.error('❌ Error querying Pinecone:', error.message);
      return [];
    }
  }

  /**
   * Get data for specific date range
   * @param {string} userId - User ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   */
  async getDataByDateRange(userId, startDate, endDate) {
    try {
      await this.initialize();

      const startTime = new Date(startDate).getTime();
      const endTime = new Date(endDate).getTime();

      // Query with date filter
      const query = `data from ${startDate} to ${endDate}`;
      const queryEmbedding = await this.embeddings.embedQuery(query);

      const results = await this.index.query({
        vector: queryEmbedding,
        topK: 100,
        filter: {
          userId,
          type: 'daily_metrics',
          timestamp: { $gte: startTime, $lte: endTime },
        },
        includeMetadata: true,
      });

      return results.matches?.map(match => match.metadata) || [];
    } catch (error) {
      console.error('❌ Error getting data by date range:', error.message);
      return [];
    }
  }

  /**
   * Delete old data for a user (optional cleanup)
   * @param {string} userId - User ID
   * @param {number} daysToKeep - Number of days to keep (default: 365)
   */
  async cleanupOldData(userId, daysToKeep = 365) {
    try {
      await this.initialize();

      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

      // Delete vectors older than cutoff
      await this.index.deleteMany({
        filter: {
          userId,
          timestamp: { $lt: cutoffTime },
        },
      });

      console.log(`🧹 Cleaned up data older than ${daysToKeep} days for user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error cleaning up old data:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default new PineconeDataSync();
