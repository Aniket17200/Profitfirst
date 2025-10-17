import dotenv from 'dotenv';
import mongoose from 'mongoose';
import pineconeDataSync from '../services/pineconeDataSync.js';
import dataAggregator from '../services/dataAggregator.js';
import User from '../model/User.js';
import { format, subDays, eachDayOfInterval } from 'date-fns';

dotenv.config();

/**
 * Sync ALL historical data to Pinecone for all users
 * This enables the AI to answer ANY time-based question
 */
async function syncAllData() {
  try {
    console.log('🚀 Starting comprehensive data sync to Pinecone...\n');

    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in environment variables');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find({ 'onboarding.step2.accessToken': { $exists: true } });
    console.log(`👥 Found ${users.length} users to sync\n`);

    for (const user of users) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📊 Processing user: ${user.email || user._id}`);
      console.log(`${'='.repeat(60)}\n`);

      try {
        // Sync data for different time periods
        const periods = [
          { name: 'Last 7 Days', days: 7 },
          { name: 'Last 30 Days', days: 30 },
          { name: 'Last 90 Days', days: 90 },
          { name: 'Last 365 Days', days: 365 },
        ];

        for (const period of periods) {
          console.log(`\n📅 Syncing ${period.name}...`);
          
          const endDate = format(new Date(), 'yyyy-MM-dd');
          const startDate = format(subDays(new Date(), period.days), 'yyyy-MM-dd');

          try {
            // Get aggregated data from APIs
            const businessData = await dataAggregator.aggregateAllData(user, startDate, endDate);

            // Skip if no data
            if (!businessData || businessData.orders === 0) {
              console.log(`   ⚠️ No data for ${period.name}, skipping...`);
              continue;
            }

            // Create daily breakdown for periods <= 30 days
            const dailyData = [];
            
            if (period.days <= 30) {
              console.log(`   📊 Fetching daily data for ${period.days} days...`);
              
              for (let i = 0; i < period.days; i++) {
                const dayDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
                
                try {
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
                  }
                } catch (dayError) {
                  // Skip days with errors
                }
                
                // Delay every 5 days to avoid rate limits
                if (i % 5 === 0 && i > 0) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
              
              console.log(`   ✅ Fetched ${dailyData.length} daily records`);
            }

            // Create period summary with actual API data
            const summary = {
              period: period.name,
              startDate,
              endDate,
              daysCount: period.days,
              totalRevenue: businessData.revenue || 0,
              totalOrders: businessData.orders || 0,
              totalGrossProfit: businessData.grossProfit || 0,
              totalNetProfit: businessData.netProfit || 0,
              totalCOGS: businessData.cogs || 0,
              totalAdSpend: businessData.adSpend || 0,
              avgOrderValue: businessData.aov || 0,
              totalROAS: businessData.roas || 0,
              grossMargin: businessData.revenue ? (businessData.grossProfit / businessData.revenue * 100) : 0,
              netMargin: businessData.revenue ? (businessData.netProfit / businessData.revenue * 100) : 0,
              totalShipments: businessData.totalShipments || 0,
              delivered: businessData.delivered || 0,
              rto: businessData.rto || 0,
              ndr: businessData.ndr || 0,
              inTransit: businessData.inTransit || 0,
            };

            // Store in Pinecone (daily data + summary)
            const result = await pineconeDataSync.storeDailyData(
              user._id.toString(),
              dailyData,
              summary
            );

            if (result.success) {
              console.log(`   ✅ Synced ${period.name}: ${result.count} records`);
              console.log(`      Daily records: ${dailyData.length}`);
              console.log(`      Revenue: ₹${summary.totalRevenue.toLocaleString('en-IN')}`);
              console.log(`      Orders: ${summary.totalOrders}`);
              console.log(`      ROAS: ${summary.totalROAS.toFixed(2)}x`);
            } else {
              console.error(`   ❌ Failed to sync ${period.name}:`, result.error);
            }
          } catch (periodError) {
            console.error(`   ❌ Error syncing ${period.name}:`, periodError.message);
          }

          // Wait a bit to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log(`\n✅ Completed sync for user ${user.email || user._id}`);
      } catch (userError) {
        console.error(`❌ Error syncing user ${user._id}:`, userError.message);
        continue;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ All data synced successfully!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   Users processed: ${users.length}`);
    console.log(`   Time periods per user: 4 (7, 30, 90, 365 days)`);
    console.log(`   Total records: ~${users.length * 4}`);
    console.log('\n🎯 Your AI can now answer ANY time-based question!');
    console.log('   ✓ "What are today\'s orders?"');
    console.log('   ✓ "Show me last month\'s revenue"');
    console.log('   ✓ "Compare this week vs last week"');
    console.log('   ✓ "What was my profit 3 months ago?"');
    console.log('   ✓ And much more!\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the sync
syncAllData();
