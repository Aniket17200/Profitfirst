import pineconeDataSync from './pineconeDataSync.js';
import dataAggregator from './dataAggregator.js';
import { format, subDays } from 'date-fns';

/**
 * Auto-sync service for Pinecone
 * Automatically syncs user data when they access the dashboard or chat
 */
class AutoSyncPinecone {
  constructor() {
    this.syncInProgress = new Map(); // Track ongoing syncs per user
    this.lastSyncTime = new Map(); // Track last sync time per user
    this.SYNC_COOLDOWN = 5 * 60 * 1000; // 5 minutes cooldown between syncs
  }

  /**
   * Check if user needs sync
   */
  needsSync(userId) {
    const lastSync = this.lastSyncTime.get(userId);
    if (!lastSync) return true;
    
    const timeSinceSync = Date.now() - lastSync;
    return timeSinceSync > this.SYNC_COOLDOWN;
  }

  /**
   * Auto-sync user data for multiple time periods
   */
  async syncUserData(user, options = {}) {
    const userId = user._id.toString();

    // Check if sync is already in progress
    if (this.syncInProgress.get(userId)) {
      console.log(`⏳ Sync already in progress for user ${userId}`);
      return { success: true, message: 'Sync in progress', skipped: true };
    }

    // Check if sync is needed (cooldown)
    if (!options.force && !this.needsSync(userId)) {
      console.log(`⏭️ Skipping sync for user ${userId} (cooldown active)`);
      return { success: true, message: 'Sync not needed yet', skipped: true };
    }

    // Mark sync as in progress
    this.syncInProgress.set(userId, true);

    try {
      console.log(`🔄 Auto-syncing data for user ${userId}...`);

      const periods = [
        { name: 'Last 7 Days', days: 7 },
        { name: 'Last 30 Days', days: 30 },
        { name: 'Last 60 Days', days: 60 },
        { name: 'Last 90 Days', days: 90 },
      ];

      const results = [];

      for (const period of periods) {
        try {
          const endDate = format(new Date(), 'yyyy-MM-dd');
          const startDate = format(subDays(new Date(), period.days), 'yyyy-MM-dd');

          console.log(`   📅 Fetching data from ${startDate} to ${endDate}...`);

          // Fetch aggregated data for the period
          const businessData = await dataAggregator.aggregateAllData(user, startDate, endDate);

          // Skip if no data
          if (!businessData || businessData.orders === 0) {
            console.log(`   ⚠️ No data for ${period.name}`);
            continue;
          }

          // Create daily breakdown for last 30 days (detailed data)
          const dailyData = [];
          
          if (period.days <= 30) {
            console.log(`   📊 Creating daily breakdown for ${period.days} days...`);
            
            for (let i = 0; i < period.days; i++) {
              const dayDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
              
              try {
                // Fetch data for this specific day
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
                    ndr: dayData.ndr || 0,
                    inTransit: dayData.inTransit || 0,
                  });
                }
              } catch (dayError) {
                console.error(`   ⚠️ Error fetching day ${dayDate}:`, dayError.message);
              }
              
              // Small delay to avoid rate limits
              if (i % 5 === 0 && i > 0) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }
            
            console.log(`   ✅ Created ${dailyData.length} daily records`);
          }

          // Create period summary
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
          const result = await pineconeDataSync.storeDailyData(userId, dailyData, summary);

          if (result.success) {
            console.log(`   ✅ Synced ${period.name}: ${result.count} records`);
            results.push({ 
              period: period.name, 
              success: true, 
              dailyRecords: dailyData.length,
              totalRecords: result.count 
            });
          } else {
            console.error(`   ❌ Failed ${period.name}:`, result.error);
            results.push({ period: period.name, success: false, error: result.error });
          }
        } catch (periodError) {
          console.error(`   ❌ Error syncing ${period.name}:`, periodError.message);
          results.push({ period: period.name, success: false, error: periodError.message });
        }
      }

      // Update last sync time
      this.lastSyncTime.set(userId, Date.now());

      console.log(`✅ Auto-sync complete for user ${userId}`);

      return {
        success: true,
        message: 'Data synced successfully',
        results,
        syncedPeriods: results.filter(r => r.success).length,
        totalPeriods: periods.length,
      };
    } catch (error) {
      console.error(`❌ Auto-sync error for user ${userId}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    } finally {
      // Clear sync in progress flag
      this.syncInProgress.delete(userId);
    }
  }

  /**
   * Force sync (bypass cooldown)
   */
  async forceSyncUserData(user) {
    return this.syncUserData(user, { force: true });
  }

  /**
   * Clear sync cooldown for a user
   */
  clearCooldown(userId) {
    this.lastSyncTime.delete(userId);
  }

  /**
   * Get sync status for a user
   */
  getSyncStatus(userId) {
    const inProgress = this.syncInProgress.get(userId) || false;
    const lastSync = this.lastSyncTime.get(userId);
    const needsSync = this.needsSync(userId);

    return {
      inProgress,
      lastSync: lastSync ? new Date(lastSync).toISOString() : null,
      needsSync,
      cooldownRemaining: lastSync ? Math.max(0, this.SYNC_COOLDOWN - (Date.now() - lastSync)) : 0,
    };
  }
}

export default new AutoSyncPinecone();
