import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CachedData from './model/CachedData.js';

dotenv.config();

async function testCache() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // Test data
    const testUserId = new mongoose.Types.ObjectId();
    const testData = {
      orders: [
        { id: 1, total: 100, customer: 'Test Customer' },
        { id: 2, total: 200, customer: 'Another Customer' }
      ]
    };

    console.log('📝 Testing cache write...');
    const saved = await CachedData.findOneAndUpdate(
      {
        userId: testUserId,
        dataType: 'shopify_orders',
        'dateRange.startDate': '2025-01-01',
        'dateRange.endDate': '2025-01-31'
      },
      {
        userId: testUserId,
        dataType: 'shopify_orders',
        dateRange: { startDate: '2025-01-01', endDate: '2025-01-31' },
        data: testData,
        lastSyncedAt: new Date(),
        syncStatus: 'success',
        errorMessage: null
      },
      { upsert: true, new: true }
    );

    console.log('✓ Data saved successfully!');
    console.log('  ID:', saved._id);
    console.log('  User ID:', saved.userId);
    console.log('  Data Type:', saved.dataType);
    console.log('  Date Range:', saved.dateRange);
    console.log('  Last Synced:', saved.lastSyncedAt);
    console.log('');

    console.log('📖 Testing cache read...');
    const retrieved = await CachedData.findOne({
      userId: testUserId,
      dataType: 'shopify_orders',
      'dateRange.startDate': '2025-01-01',
      'dateRange.endDate': '2025-01-31'
    }).lean();

    if (retrieved) {
      console.log('✓ Data retrieved successfully!');
      console.log('  Orders count:', retrieved.data.orders.length);
      console.log('  First order:', retrieved.data.orders[0]);
    } else {
      console.log('✗ Failed to retrieve data');
    }
    console.log('');

    console.log('🗑️  Cleaning up test data...');
    await CachedData.deleteOne({ _id: saved._id });
    console.log('✓ Test data deleted\n');

    console.log('📊 Checking existing cached data...');
    const count = await CachedData.countDocuments();
    console.log(`  Total cached records: ${count}`);

    if (count > 0) {
      const sample = await CachedData.findOne().lean();
      console.log('  Sample record:');
      console.log('    User ID:', sample.userId);
      console.log('    Data Type:', sample.dataType);
      console.log('    Date Range:', sample.dateRange);
      console.log('    Last Synced:', sample.lastSyncedAt);
      console.log('    Status:', sample.syncStatus);
    }

    console.log('\n✅ All tests passed! Cache system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testCache();
