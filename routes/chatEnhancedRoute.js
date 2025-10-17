import express from 'express';
import {
  initEnhancedChat,
  sendEnhancedMessage,
  syncHistoricalData,
  queryPineconeData,
} from '../controller/chatEnhanced.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Initialize enhanced chat session (syncs current data to Pinecone)
router.post('/init', authenticateToken, initEnhancedChat);

// Send message and get AI response (uses Pinecone for context)
router.post('/message', authenticateToken, sendEnhancedMessage);

// Sync historical data to Pinecone (bulk import)
router.post('/sync', authenticateToken, syncHistoricalData);

// Query Pinecone directly (for testing)
router.post('/query', authenticateToken, queryPineconeData);

export default router;
