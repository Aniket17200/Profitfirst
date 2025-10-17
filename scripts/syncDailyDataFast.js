/**
 * Fast Daily Data Sync - Only Last 7 Days
 * Quick sync for testing (1-2 minutes instead of 10)
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import pineconeDataSync from '../services/pineconeDataSync.js';
import dataAggregator from '../services/dataAggregator.js';
import User from '../model/User.js';
import { format, subDays } from 'date-fns';

dotenv.config();

async function syncDailyDataFast() {
  try {
    console.log('⚡ Fast Daily Data Sync - Last 7 Days\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const user = await User.findOne({ 'onboarding.step2.accessToken': { $exists: true } });
    
    if (!user) {
      console.log('❌ No users found');
      process.exit(1);
    }

    const userId = user._id.toString();
    console.log(`👤 Syncing for: ${user.email || userId}\n`);

    // Sync only last 7 days for speed
    const dailyData = [];
    
    console.log('📊 Fetching daily data for last 7 days...\n');
    
    for (let i = 0; i < 7; i++) {
      const dayDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
      
      try {
        console.log(`   ${i + 1}/7: Fetching ${dayDate}...`);
        
        const dayData = await dataAggregator.aggregateAllData(user, dayDate, dayDate);
        
        if (dayData && dayData.orders > 0) {
          dailyData.push({
            date: dayDate,
            revenue: dayData.revenue || 0,
            orders: dayData.orders || 0,
            roas: dayData.roas || 0,
            adSpend: dayData.adSpend || 0,
            grossProfit: dayData.grossProfit || 0,
            netProfit: dayData.netProfit || 0,
            aov: dayData.aov || 0,
            cogs: dayData.cogs || 0,
            shippingCost: dayData.shippingCost || 0,
            shipments: dayData.totalShipments || 0,
            delivered: dayData.delivered || 0,
            rto: dayData.rto || 0,
          });
          console.log(`      ✅ Orders: ${dayData.orders}, Revenue: ₹${dayData.revenue.toLocaleString('en-IN')}`);
        } else {
          console.log(`      ⚠️ No data`);
        }
      } catch (dayError) {
        console.log(`      ❌ Error: ${dayError.message}`);
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ Fetched ${dailyData.length} daily records\n`);

    // Create 7-day summary
    const summary = {
      period: 'Last 7 Days',
      startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      daysCount: 7,
      totalRevenue: dailyData.reduce((sum, d) => sum + d.revenue, 0),
      totalOrders: dailyData.reduce((sum, d) => sum + d.orders, 0),
      totalGrossProfit: dailyData.reduce((sum, d) => sum + d.grossProfit, 0),
      totalNetProfit: dailyData.reduce((sum, d) => sum + d.netProfit, 0),
      totalCOGS: dailyData.reduce((sum, d) => sum + d.cogs, 0),
      totalAdSpend: dailyData.reduce((sum, d) => sum + d.adSpend, 0),
      avgOrderValue: dailyData.reduce((sum, d) => sum + d.aov, 0) / dailyData.length,
      totalROAS: dailyData.reduce((sum, d) => sum + d.roas, 0) / dailyData.length,
    };

    // Store in Pinecone
    console.log('📤 Storing in Pinecone...\n');
    const result = await pineconeDataSync.storeDailyData(userId, dailyData, summary);

    if (result.success) {
      console.log(`✅ Synced ${result.count} records to Pinecone\n`);
      console.log('📊 Summary:');
      console.log(`   Daily records: ${dailyData.length}`);
      console.log(`   Total revenue: ₹${summary.totalRevenue.toLocaleString('en-IN')}`);
      console.log(`   Total orders: ${summary.totalOrders}`);
      console.log(`   Average ROAS: ${summary.totalROAS.toFixed(2)}x\n`);
      console.log('🎯 Your AI can now answer questions about the last 7 days!');
      console.log('   Try: "What was the profit on [recent date]?"');
    } else {
      console.error('❌ Failed to sync:', result.error);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Done!');
    process.exit(0);
  }
}

syncDailyDataFast();
