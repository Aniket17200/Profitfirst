# 🚀 Deploy Your Application NOW - Simple Guide

## ⚡ One Command Deployment

Your server is ready at: **3.108.210.145**

---

## 🎯 Quick Deploy (Choose One Method)

### Method 1: Using Git Bash (Recommended for Windows)

```bash
# Open Git Bash in your project folder
chmod +x deploy-to-server.sh
./deploy-to-server.sh
```

### Method 2: Using WSL/Linux

```bash
chmod +x deploy-to-server.sh
./deploy-to-server.sh
```

### Method 3: Manual Steps (If scripts don't work)

```bash
# 1. Upload files
scp -r -i terraform/profit-first-key.pem * ubuntu@3.108.210.145:/home/ubuntu/app/

# 2. SSH into server
ssh -i terraform/profit-first-key.pem ubuntu@3.108.210.145

# 3. Configure environment
cd /home/ubuntu/app
cp .env.example .env
nano .env  # Update all API keys

# 4. Deploy
chmod +x deploy.sh
./deploy.sh

# 5. Check status
./status.sh
```

---

## ⚙️ Configure Environment Variables

Before or after deployment, you MUST update `.env` file:

```bash
# SSH into server
ssh -i terraform/profit-first-key.pem ubuntu@3.108.210.145

# Edit .env
cd /home/ubuntu/app
nano .env
```

**Required variables:**
- `MONGODB_URI` - Your MongoDB connection string
- `OPENAI_API_KEY` - Your OpenAI API key
- `PINECONE_API_KEY` - Your Pinecone API key
- `JWT_SECRET` - A secure random string
- All Shopify credentials (step2)
- All Meta/Facebook credentials (step4)
- All Shiprocket credentials (step5)

**Save:** Ctrl+X, then Y, then Enter

---

## 🌐 Access Your Application

After deployment (wait 5-10 minutes for build):

```
http://3.108.210.145
```

---

## 🔍 Check if It's Running

### From Browser
```
http://3.108.210.145
```

### From Command Line
```bash
# Test if server responds
curl http://3.108.210.145
```

### On Server
```bash
# SSH into server
ssh -i terraform/profit-first-key.pem ubuntu@3.108.210.145

# Check status
./status.sh

# Or
pm2 status
pm2 logs profit-first
```

---

## 📊 Expected Output

### PM2 Status (Good)
```
┌─────┬──────────────┬─────────┬─────────┐
│ id  │ name         │ status  │ restart │
├─────┼──────────────┼─────────┼─────────┤
│ 0   │ profit-first │ online  │ 0       │
└─────┴──────────────┴─────────┴─────────┘
```

### Application Logs (Good)
```
Server listening at http://localhost:3000
Connected to MongoDB
✅ All systems operational
```

---

## 🐛 Troubleshooting

### Script Won't Run

**Use Git Bash instead of PowerShell:**
1. Install Git for Windows (includes Git Bash)
2. Open Git Bash in your project folder
3. Run: `./deploy-to-server.sh`

### Can't Upload Files

**Try manual SCP:**
```bash
# In Git Bash
cd /d/Aniketcoding/ProfitfirstAutomate-main/ProfitfirstAutomate-main
scp -r -i terraform/profit-first-key.pem * ubuntu@3.108.210.145:/home/ubuntu/app/
```

### Application Won't Start

**Check logs:**
```bash
ssh -i terraform/profit-first-key.pem ubuntu@3.108.210.145
pm2 logs profit-first
```

**Common issues:**
1. Missing .env file → Copy from .env.example
2. Wrong MongoDB URI → Check connection string
3. Missing API keys → Add all required keys
4. Build failed → Check Node.js version

**Solution:**
```bash
# On server
cd /home/ubuntu/app
nano .env  # Fix environment variables
./deploy.sh  # Redeploy
```

---

## 🔄 Update Your Application

To update code after making changes:

```bash
# Run the deployment script again
./deploy-to-server.sh
```

Or manually:
```bash
# Upload new files
scp -r -i terraform/profit-first-key.pem * ubuntu@3.108.210.145:/home/ubuntu/app/

# SSH and redeploy
ssh -i terraform/profit-first-key.pem ubuntu@3.108.210.145
cd /home/ubuntu/app
./deploy.sh
```

---

## 📝 Quick Commands Reference

```bash
# Deploy everything
./deploy-to-server.sh

# SSH into server
ssh -i terraform/profit-first-key.pem ubuntu@3.108.210.145

# Check status
./status.sh

# View logs
pm2 logs profit-first

# Restart app
pm2 restart profit-first

# Stop app
pm2 stop profit-first

# Start app
pm2 start profit-first
```

---

## ✅ Success Checklist

- [ ] Files uploaded to server
- [ ] .env file configured
- [ ] Deployment script ran successfully
- [ ] PM2 shows "online" status
- [ ] Can access http://3.108.210.145
- [ ] Application loads in browser
- [ ] Can login/signup
- [ ] Dashboard works
- [ ] AI chat works

---

## 🎉 You're Done!

Your application should now be live at:

```
http://3.108.210.145
```

**Next steps:**
1. Test all features
2. Configure your domain (optional)
3. Setup SSL/HTTPS (optional)
4. Monitor performance

---

## 📞 Need Help?

**Check these files:**
- `DEPLOYMENT_COMPLETE.md` - Complete guide
- `DEPLOYMENT_GUIDE.md` - Detailed instructions
- `terraform/TROUBLESHOOTING.md` - Common issues

**Or SSH into server and check logs:**
```bash
ssh -i terraform/profit-first-key.pem ubuntu@3.108.210.145
pm2 logs profit-first
```

---

**Happy Deploying! 🚀**

Your application is ready to go live!
