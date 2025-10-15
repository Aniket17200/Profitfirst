# 🚀 Quick Start Guide

## What Changed?

Your ProfitFirst app now has **intelligent data caching** that makes it **30x faster**!

### Before ❌
- Dashboard took 10-30 seconds to load
- Every request called Shopify, Meta, and Shiprocket APIs
- API rate limits were a problem

### After ✅
- Dashboard loads in <1 second
- Data stored in MongoDB and served instantly
- Background job syncs data every 30 minutes
- No more API rate limit issues

---

## 🎯 Start the Application

### Option 1: One-Click Start (Recommended)
```bash
start-all.bat
```
This will:
1. Install dependencies
2. Start backend server (http://localhost:3000)
3. Start frontend (http://localhost:5173)

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

---

## ✅ Verify It's Working

### 1. Check Console Logs
You should see:
```
Server listening at http://localhost:3000
🚀 Starting automatic data sync...
[SYNC JOB] Auto-sync started - runs every 30 minutes
Connected to MongoDB
```

### 2. Open Frontend
- Go to http://localhost:5173
- Login with your credentials
- Open the dashboard

### 3. Watch the Magic
**First Load:**
- May take 10-20 seconds (building cache)
- Console shows: `[DASHBOARD] Fetching fresh data for user...`

**Second Load:**
- Loads instantly (<1 second)
- Console shows: `[DASHBOARD] Using cached data for user...`

---

## 📊 How It Works

```
┌──────────────┐
│ User Request │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Check MongoDB Cache  │
└──────┬───────────────┘
       │
       ├─── Cache Fresh? ──► YES ──► Return Data (Fast!)
       │
       └─── Cache Old? ───► NO ───► Fetch from APIs
                                     │
                                     ▼
                              Update MongoDB
                                     │
                                     ▼
                              Return Data

Background Job (Every 30 min):
  ↓
Sync all users' data automatically
  ↓
Keep cache fresh
```

---

## 🔍 Monitor Sync Status

### Console Logs
Every 30 minutes you'll see:
```
[SYNC JOB] Starting data sync...
[SYNC JOB] Found 3 users to sync
[SYNC JOB] Syncing data for user 507f1f77bcf86cd799439011
[SYNC JOB] Successfully synced user 507f1f77bcf86cd799439011
[SYNC JOB] Data sync completed
```

### Dashboard Requests
```
[DASHBOARD] Using cached data for user 507f... ← Fast!
[DASHBOARD] Fetching fresh data for user 507f... ← First time or expired
```

---

## ⚙️ Configuration

### Change Sync Frequency
Edit `.env`:
```env
DATA_SYNC_INTERVAL=30  # Change to 15, 60, etc. (minutes)
CACHE_TTL_MINUTES=30   # How long cache is valid
```

Then restart the server.

---

## 🐛 Troubleshooting

### Server Won't Start?
```bash
# Install dependencies
npm install

# Check for errors
npm run dev
```

### Data Not Loading?
1. Check MongoDB connection in `.env`
2. Verify user has completed onboarding (Shopify, Meta, Shiprocket setup)
3. Check console for error messages

### Cache Not Working?
1. Wait 30 minutes for first sync
2. Or make a dashboard request to trigger sync
3. Check MongoDB connection

### Sync Job Not Running?
1. Restart the server
2. Check console for `[SYNC JOB]` messages
3. Verify `node-cron` is installed: `npm list node-cron`

---

## 📁 New Files (Don't Delete!)

```
services/
  ├── dataCache.js          ← MongoDB caching logic
  ├── metaService.js        ← Meta Ads API
  └── shiprocketService.js  ← Shiprocket API

jobs/
  └── dataSyncJob.js        ← Auto-sync every 30 min

model/
  └── CachedData.js         ← Cache database schema

start-all.bat               ← Easy startup script
SETUP.md                    ← Detailed documentation
SYSTEM_OVERVIEW.md          ← Architecture guide
```

---

## 🎯 What to Expect

### Performance
- **First request**: 10-20 seconds (building cache)
- **Subsequent requests**: <1 second (from cache)
- **Background sync**: Automatic every 30 minutes

### API Calls
- **Before**: 3 calls per dashboard request
- **After**: 3 calls per 30 minutes (per user)
- **Savings**: ~95% reduction

### User Experience
- Dashboard loads instantly
- No waiting for API responses
- Smooth, fast navigation

---

## 💡 Pro Tips

1. **First time setup**: Let the app run for 30 minutes to build initial cache
2. **Multiple users**: Each user's data is cached separately
3. **Date ranges**: Different date ranges are cached independently
4. **Old data**: Auto-deleted after 7 days to save space

---

## 🎉 You're All Set!

1. Run `start-all.bat`
2. Open http://localhost:5173
3. Login and enjoy instant dashboard loading!

**Questions?** Check `SETUP.md` for detailed documentation.

---

**Made with ❤️ for faster dashboards**
