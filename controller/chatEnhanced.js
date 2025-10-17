import enhancedAI from '../services/enhancedAI.js';
import pineconeDataSync from '../services/pineconeDataSync.js';
import dataAggregator from '../services/dataAggregator.js';
import autoSyncPinecone from '../services/autoSyncPinecone.js';
import { format, subDays } from 'date-fns';

/**
 * Enhanced Chat Controller with Pinecone Integration
 * Automatically syncs data and answers ALL questions accurately
 */

/**
 * Initialize chat session and sync data to Pinecone
 */
export async function initEnhancedChat(req, res) {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('🚀 Initializing enhanced chat for user:', user._id);

    // Auto-sync data for multiple time periods (7, 30, 60, 90 days)
    console.log('💾 Auto-syncing data to Pinecone...');
    const syncResult = await autoSyncPinecone.syncUserData(user);

    // Get current 30-day data for immediate use
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const businessData = await dataAggregator.aggregateAllData(user, startDate, endDate);

    return res.status(200).json({
      success: true,
      message: 'Enhanced chat initialized',
      businessData,
      pineconeSync: {
        success: syncResult.success,
        syncedPeriods: syncResult.syncedPeriods || 0,
        totalPeriods: syncResult.totalPeriods || 4,
        skipped: syncResult.skipped || false,
      },
      userId: user._id,
    });
  } catch (error) {
    console.error('❌ Init enhanced chat error:', error.message);
    return res.status(500).json({
      error: 'Failed to initialize chat',
      message: error.message,
    });
  }
}

/**
 * Send message and get AI response using Pinecone data
 */
export async function sendEnhancedMessage(req, res) {
  try {
    const { message, businessData } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`💬 User ${user._id} asked: "${message}"`);

    // Generate response using enhanced AI with Pinecone
    const result = await enhancedAI.generateResponse(
      user._id.toString(),
      message.trim(),
      businessData
    );

    if (!result.success) {
      return res.status(500).json({
        error: 'Failed to generate response',
        message: result.error,
      });
    }

    console.log(`✅ Response generated (${result.dataPoints} data points used)`);

    return res.status(200).json({
      success: true,
      reply: result.answer,
      dataPoints: result.dataPoints,
      queryAnalysis: result.queryAnalysis,
    });
  } catch (error) {
    console.error('❌ Send enhanced message error:', error.message);
    return res.status(500).json({
      error: 'Failed to process message',
      message: error.message,
    });
  }
}

/**
 * Sync historical data to Pinecone (for bulk import)
 */
export async function syncHistoricalData(req, res) {
  try {
    const { dailyData, summary } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log(`📤 Syncing historical data for user ${user._id}`);
    console.log(`   Daily records: ${dailyData?.length || 0}`);
    console.log(`   Summary: ${summary ? 'Yes' : 'No'}`);

    const result = await pineconeDataSync.storeDailyData(
      user._id.toString(),
      dailyData || [],
      summary
    );

    return res.status(200).json({
      success: result.success,
      message: result.success ? 'Data synced successfully' : 'Sync failed',
      count: result.count,
      error: result.error,
    });
  } catch (error) {
    console.error('❌ Sync historical data error:', error.message);
    return res.status(500).json({
      error: 'Failed to sync data',
      message: error.message,
    });
  }
}

/**
 * Query Pinecone directly (for testing)
 */
export async function queryPineconeData(req, res) {
  try {
    const { query, topK = 10 } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`🔍 Querying Pinecone: "${query}"`);

    const results = await pineconeDataSync.queryData(
      user._id.toString(),
      query,
      topK
    );

    return res.status(200).json({
      success: true,
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('❌ Query Pinecone error:', error.message);
    return res.status(500).json({
      error: 'Failed to query data',
      message: error.message,
    });
  }
}
