/**
 * Check what data exists in Pinecone
 * Helps diagnose why AI isn't giving day-wise answers
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import pineconeDataSync from '../services/pineconeDataSync.js';
import User from '../model/User.js';
import { format, subDays } from 'date-fns';

dotenv.config();

async function checkPineconeData() {
  try {
    console.log('🔍 Checking Pinecone Data...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get first user with onboarding complete
    const user = await User.findOne({ 'onboarding.step2.accessToken': { $exists: true } });
    
    if (!user) {
      console.log('❌ No users found with complete onboarding');
      process.exit(1);
    }

    const userId = user._id.toString();
    console.log(`👤 Checking data for user: ${user.email || userId}\n`);

    // Check for specific dates
    const datesToCheck = [
      format(new Date(), 'yyyy-MM-dd'),           // Today
      format(subDays(new Date(), 1), 'yyyy-MM-dd'), // Yesterday
      format(subDays(new Date(), 2), 'yyyy-MM-dd'), // 2 days ago
      format(subDays(new Date(), 7), 'yyyy-MM-dd'), // 1 week ago
      '2023-10-02',                                 // Specific date
    ];

    console.log('📅 Checking for daily data...\n');

    for (const date of datesToCheck) {
      console.log(`   Checking ${date}...`);
      
      const results = await pineconeDataSync.queryData(
        userId,
        `data for ${date}`,
        5,
        {
          type: 'daily_metrics',
          date: date
        }
      );

      if (results.length > 0) {
        console.log(`   ✅ Found ${results.length} records`);
        results.forEach((r, idx) => {
          console.log(`      ${idx + 1}. Date: ${r.metadata.date}, Orders: ${r.metadata.orders}, Revenue: ₹${r.metadata.revenue?.toLocaleString('en-IN')}`);
        });
      } else {
        console.log(`   ❌ No daily data found`);
      }
      console.log('');
    }

    // Check for period summaries
    console.log('📊 Checking for period summaries...\n');

    const periods = ['Last 7 Days', 'Last 30 Days', 'Last 60 Days', 'Last 90 Days'];

    for (const period of periods) {
      console.log(`   Checking ${period}...`);
      
      const results = await pineconeDataSync.queryData(
        userId,
        period,
        3,
        {
          type: 'period_summary'
        }
      );

      if (results.length > 0) {
        console.log(`   ✅ Found ${results.length} summaries`);
        results.forEach((r, idx) => {
          console.log(`      ${idx + 1}. Period: ${r.metadata.period}, Orders: ${r.metadata.totalOrders}, Revenue: ₹${r.metadata.totalRevenue?.toLocaleString('en-IN')}`);
        });
      } else {
        console.log(`   ❌ No summary found`);
      }
      console.log('');
    }

    // General query test
    console.log('🔍 Testing general query...\n');
    
    const generalResults = await pineconeDataSync.queryData(
      userId,
      'What was the profit on 2 October?',
      10
    );

    console.log(`   Found ${generalResults.length} results for "What was the profit on 2 October?"`);
    generalResults.forEach((r, idx) => {
      console.log(`   ${idx + 1}. Type: ${r.metadata.type}, Date: ${r.metadata.date || 'N/A'}, Period: ${r.metadata.period || 'N/A'}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));

    const hasDailyData = generalResults.some(r => r.metadata.type === 'daily_metrics');
    const hasSummaryData = generalResults.some(r => r.metadata.type === 'period_summary');

    if (hasDailyData) {
      console.log('✅ Daily data EXISTS in Pinecone');
      console.log('   AI should be able to answer date-specific questions');
    } else {
      console.log('❌ NO daily data in Pinecone');
      console.log('   AI will give 30-day summaries instead of date-specific answers');
      console.log('\n💡 SOLUTION: Run sync script to populate daily data:');
      console.log('   node scripts/syncAllDataToPinecone.js');
    }

    if (hasSummaryData) {
      console.log('✅ Period summaries exist in Pinecone');
    } else {
      console.log('⚠️ No period summaries in Pinecone');
    }

    console.log('\n🎯 RECOMMENDATION:');
    if (!hasDailyData) {
      console.log('   1. Run: node scripts/syncAllDataToPinecone.js');
      console.log('   2. Wait for sync to complete (may take 5-10 minutes)');
      console.log('   3. Test AI again with: "What was the profit on 2 October?"');
      console.log('   4. AI should now give date-specific answers!');
    } else {
      console.log('   Daily data exists! If AI still gives wrong answers:');
      console.log('   1. Check that Enhanced AI endpoint is being used');
      console.log('   2. Check console logs for "🎯 Querying for SPECIFIC DATE"');
      console.log('   3. Verify date parsing is working');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Done!');
    process.exit(0);
  }
}

checkPineconeData();
