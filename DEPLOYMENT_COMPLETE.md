# 🎉 Infrastructure Deployed Successfully!

## ✅ Your Server is Running!

**Public IP:** `3.108.210.145`  
**Instance ID:** `i-03f07a8c646faee4e`  
**Status:** Running ✅

---

## 🚀 Next Steps: Deploy Your Application

### Step 1: Connect to Server

```powershell
ssh -i profit-first-key.pem ubuntu@3.108.210.145
```

**Note:** If using PowerShell and getting errors, use Git Bash or WSL instead.

---

### Step 2: Upload Your Code

Once connected to the server, you have two options:

#### Option A: Using Git (Recommended)

```bash
cd /home/ubuntu/app
git clone YOUR_GITHUB_REPO_URL .
```

#### Option B: Using SCP (from your local machine)

Open a **new PowerShell window** (don't close the SSH session):

```powershell
# Navigate to your project folder
cd D:\Aniketcoding\ProfitfirstAutomate-main\ProfitfirstAutomate-main

# Upload all files (excluding node_modules)
scp -i terraform\profit-first-key.pem -r * ubuntu@3.108.210.145:/home/ubuntu/app/
```

---

### Step 3: Configure Environment Variables

On the server (in SSH session):

```bash
cd /home/ubuntu/app
cp .env.example .env
nano .env
```

Update these variables:
- `MONGODB_URI` - Your MongoDB connection string
- `OPENAI_API_KEY` - Your OpenAI API key
- `PINECONE_API_KEY` - Your Pinecone API key
- `PINECONE_INDEX_NAME` - profitfirst-analytics
- `JWT_SECRET` - A secure random string
- All Shopify, Meta, and Shiprocket credentials

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### Step 4: Deploy Application

```bash
./deploy.sh
```

This will:
1. Install backend dependencies
2. Build frontend
3. Start application with PM2

**Wait 5-10 minutes for build to complete.**

---

### Step 5: Check Application Status

```bash
./status.sh
```

Or:

```bash
pm2 status
pm2 logs profit-first
```

---

## 🌐 Access Your Application

### Via IP Address (HTTP)

Open browser: **http://3.108.210.145**

You should see your application!

---

## 🔍 How to Check if Application is Running

### Method 1: Check from Browser

```
http://3.108.210.145
```

Should show your application.

### Method 2: Check from Command Line

```bash
# From your local machine
curl http://3.108.210.145

# Should return HTML
```

### Method 3: Check on Server

```bash
# SSH into server
ssh -i profit-first-key.pem ubuntu@3.108.210.145

# Check PM2 status
pm2 status

# Should show:
# ┌─────┬──────────────┬─────────┬─────────┐
# │ id  │ name         │ status  │ restart │
# ├─────┼──────────────┼─────────┼─────────┤
# │ 0   │ profit-first │ online  │ 0       │
# └─────┴──────────────┴─────────┴─────────┘

# Check logs
pm2 logs profit-first --lines 20

# Should show:
# Server listening at http://localhost:3000
```

### Method 4: Check Nginx

```bash
# Check Nginx status
sudo systemctl status nginx

# Should show: active (running)
```

---

## 🐛 Troubleshooting

### Can't SSH into Server

**Issue:** Permission denied or connection refused

**Solution:**
```powershell
# Use Git Bash instead of PowerShell
# Or use WSL (Windows Subsystem for Linux)

# In Git Bash:
chmod 400 profit-first-key.pem
ssh -i profit-first-key.pem ubuntu@3.108.210.145
```

### Application Not Starting

**Check logs:**
```bash
pm2 logs profit-first
```

**Common issues:**
1. Missing .env file
2. Wrong MongoDB connection string
3. Missing API keys
4. Port already in use

**Solution:**
```bash
# Check .env exists
cat .env

# Restart application
pm2 restart profit-first

# Or redeploy
./deploy.sh
```

### Can't Access via Browser

**Check:**
1. Is PM2 running? `pm2 status`
2. Is Nginx running? `sudo systemctl status nginx`
3. Is port 80 open? (Should be by default)

**Solution:**
```bash
# Restart Nginx
sudo systemctl restart nginx

# Restart application
pm2 restart profit-first
```

---

## 📊 Quick Status Check Commands

```bash
# Application status
./status.sh

# PM2 status
pm2 status

# View logs
pm2 logs profit-first

# Monitor resources
pm2 monit

# Nginx status
sudo systemctl status nginx

# Check if app is listening
curl http://localhost:3000

# Check disk space
df -h

# Check memory
free -h
```

---

## 🌐 Setup Domain (Optional)

### Step 1: Point Domain to IP

Add DNS A record:
```
Type: A
Name: @
Value: 3.108.210.145
TTL: 300
```

### Step 2: Setup SSL (After DNS propagates)

```bash
# SSH into server
ssh -i profit-first-key.pem ubuntu@3.108.210.145

# Install Certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts
# Choose option 2 (redirect HTTP to HTTPS)
```

---

## ✅ Deployment Checklist

- [ ] Infrastructure deployed (✅ Done!)
- [ ] SSH into server
- [ ] Upload application code
- [ ] Configure .env file
- [ ] Run ./deploy.sh
- [ ] Check PM2 status
- [ ] Test in browser
- [ ] Configure DNS (optional)
- [ ] Setup SSL (optional)

---

## 🎯 Your Application URLs

**Current (HTTP):**
```
http://3.108.210.145
```

**After DNS Setup:**
```
http://yourdomain.com
https://yourdomain.com (after SSL)
```

---

## 📝 Important Information

**Server Details:**
- IP: 3.108.210.145
- Region: ap-south-1 (Mumbai)
- Instance: t3.micro
- OS: Ubuntu 22.04
- Node.js: 20.x
- PM2: Installed
- Nginx: Installed

**SSH Command:**
```bash
ssh -i profit-first-key.pem ubuntu@3.108.210.145
```

**Application Directory:**
```
/home/ubuntu/app
```

**Logs Location:**
```
PM2 logs: pm2 logs profit-first
Nginx logs: /var/log/nginx/
```

---

## 🚀 Quick Start Commands

```bash
# Connect to server
ssh -i profit-first-key.pem ubuntu@3.108.210.145

# Check status
./status.sh

# View logs
pm2 logs profit-first

# Restart app
pm2 restart profit-first

# Update code (if using Git)
cd /home/ubuntu/app
git pull
./deploy.sh
```

---

## 💰 Monthly Cost

**~$9-10/month** for t3.micro in Mumbai region

---

## 🎉 Success!

Your infrastructure is deployed and ready!

**Next:** Upload your code and deploy the application.

**Need help?** See:
- `DEPLOYMENT_GUIDE.md` - Complete guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step
- `terraform/TROUBLESHOOTING.md` - Common issues

---

**Happy Deploying! 🚀**
