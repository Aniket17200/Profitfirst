# 🚀 AWS Deployment Guide - Profit First Application

## Overview

This guide will help you deploy your Profit First application to AWS EC2 in Mumbai region using Terraform.

---

## 📋 Prerequisites

### 1. AWS Account Setup
- AWS Account: https://078109852021.signin.aws.amazon.com/console
- Region: ap-south-1 (Mumbai)
- Access: IAM user with EC2, VPC, and EIP permissions

### 2. Local Requirements
- Terraform installed: https://www.terraform.io/downloads
- AWS CLI installed: https://aws.amazon.com/cli/
- SSH client (PuTTY for Windows, Terminal for Mac/Linux)

---

## 🔑 Step 1: AWS Credentials Setup

### Option A: Using AWS CLI

```bash
# Configure AWS credentials
aws configure

# Enter when prompted:
AWS Access Key ID: YOUR_ACCESS_KEY
AWS Secret Access Key: YOUR_SECRET_KEY
Default region name: ap-south-1
Default output format: json
```

### Option B: Using Environment Variables

```bash
# Windows (PowerShell)
$env:AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY"
$env:AWS_SECRET_ACCESS_KEY="YOUR_SECRET_KEY"
$env:AWS_DEFAULT_REGION="ap-south-1"

# Mac/Linux
export AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_KEY"
export AWS_DEFAULT_REGION="ap-south-1"
```

---

## 🔐 Step 2: Create SSH Key Pair

### In AWS Console:

1. Go to EC2 Dashboard
2. Click "Key Pairs" in left menu
3. Click "Create key pair"
4. Name: `profit-first-key`
5. Type: RSA
6. Format: .pem (Mac/Linux) or .ppk (Windows/PuTTY)
7. Click "Create key pair"
8. **Save the downloaded file securely!**

### Set Permissions (Mac/Linux):

```bash
chmod 400 profit-first-key.pem
```

---

## 🏗️ Step 3: Deploy Infrastructure with Terraform

### 1. Navigate to Terraform Directory

```bash
cd terraform
```

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Review the Plan

```bash
terraform plan
```

### 4. Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted.

**⏱️ Deployment takes 3-5 minutes**

### 5. Save the Output

After deployment, you'll see:
- **Public IP Address** (use this for DNS)
- **SSH Command**
- **Application URL**

**Example Output:**
```
public_ip = "13.232.XXX.XXX"
ssh_command = "ssh -i profit-first-key.pem ubuntu@13.232.XXX.XXX"
application_url = "http://13.232.XXX.XXX"
```

---

## 📦 Step 4: Upload Your Application

### Option A: Using Git (Recommended)

```bash
# SSH into server
ssh -i profit-first-key.pem ubuntu@YOUR_IP

# Clone your repository
cd /home/ubuntu/app
git clone YOUR_GITHUB_REPO_URL .
```

### Option B: Using SCP (Direct Upload)

```bash
# From your local machine (in project root)
scp -r -i profit-first-key.pem ./* ubuntu@YOUR_IP:/home/ubuntu/app/

# Exclude node_modules
scp -r -i profit-first-key.pem --exclude=node_modules ./* ubuntu@YOUR_IP:/home/ubuntu/app/
```

---

## ⚙️ Step 5: Configure Environment Variables

### 1. SSH into Server

```bash
ssh -i profit-first-key.pem ubuntu@YOUR_IP
```

### 2. Navigate to App Directory

```bash
cd /home/ubuntu/app
```

### 3. Create .env File

```bash
cp .env.example .env
nano .env
```

### 4. Update Environment Variables

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=profitfirst-analytics

# JWT
JWT_SECRET=your_secure_jwt_secret

# Server
PORT=3000
NODE_ENV=production

# Add all other required variables from .env.example
```

**Save:** Ctrl+X, then Y, then Enter

---

## 🚀 Step 6: Deploy Application

### Run Deployment Script

```bash
./deploy.sh
```

This script will:
1. Install backend dependencies
2. Build frontend
3. Start application with PM2
4. Configure auto-restart

**⏱️ Takes 5-10 minutes**

---

## ✅ Step 7: Verify Deployment

### Check Application Status

```bash
./status.sh
```

### View Logs

```bash
pm2 logs profit-first
```

### Test Application

```bash
# From your local machine
curl http://YOUR_IP

# Or open in browser
http://YOUR_IP
```

---

## 🌐 Step 8: Configure DNS

### Get Your IP Address

From Terraform output or:
```bash
terraform output public_ip
```

### Add DNS Records

Go to your domain registrar (GoDaddy, Namecheap, etc.) and add:

**A Record (Root Domain):**
```
Type: A
Name: @
Value: YOUR_IP_ADDRESS
TTL: 300
```

**A Record (WWW Subdomain):**
```
Type: A
Name: www
Value: YOUR_IP_ADDRESS
TTL: 300
```

**⏱️ DNS propagation: 5-60 minutes**

### Verify DNS

```bash
# Check if DNS is working
nslookup yourdomain.com

# Or
dig yourdomain.com
```

---

## 🔒 Step 9: Setup SSL (HTTPS) - Optional but Recommended

### 1. SSH into Server

```bash
ssh -i profit-first-key.pem ubuntu@YOUR_IP
```

### 2. Install Certbot

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

### 3. Get SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter email address
- Agree to terms
- Choose redirect HTTP to HTTPS (recommended)

### 4. Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

**🎉 Your site is now HTTPS!**

---

## 📊 Monitoring & Maintenance

### Check Application Status

```bash
ssh -i profit-first-key.pem ubuntu@YOUR_IP
./status.sh
```

### View Real-time Logs

```bash
pm2 logs profit-first --lines 100
```

### Restart Application

```bash
pm2 restart profit-first
```

### Update Application

```bash
cd /home/ubuntu/app
git pull  # If using Git
./deploy.sh
```

### Check Server Resources

```bash
# CPU and Memory
htop

# Disk space
df -h

# PM2 monitoring
pm2 monit
```

---

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs profit-first

# Check .env file
cat .env

# Restart
pm2 restart profit-first
```

### Can't Connect to Server

```bash
# Check security group in AWS Console
# Ensure port 22 (SSH) is open

# Check key permissions
chmod 400 profit-first-key.pem
```

### Nginx Errors

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### MongoDB Connection Issues

```bash
# Check if MongoDB URI is correct in .env
cat .env | grep MONGODB_URI

# Test connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.log('Error:', e))"
```

### Out of Memory

```bash
# Check memory usage
free -h

# Restart application
pm2 restart profit-first

# Consider upgrading to t3.small if needed
```

---

## 💰 Cost Estimation

### Monthly Costs (Mumbai Region)

| Resource | Type | Cost/Month |
|----------|------|------------|
| EC2 Instance | t3.micro | ~$7.50 |
| EBS Storage | 20 GB gp3 | ~$1.60 |
| Elastic IP | 1 IP | Free (if attached) |
| Data Transfer | First 100 GB | Free |
| **Total** | | **~$9-10/month** |

**Note:** Costs may vary based on usage and data transfer.

---

## 🔄 Updating Your Application

### Method 1: Git Pull (Recommended)

```bash
ssh -i profit-first-key.pem ubuntu@YOUR_IP
cd /home/ubuntu/app
git pull
./deploy.sh
```

### Method 2: SCP Upload

```bash
# From local machine
scp -r -i profit-first-key.pem ./* ubuntu@YOUR_IP:/home/ubuntu/app/

# Then SSH and deploy
ssh -i profit-first-key.pem ubuntu@YOUR_IP
cd /home/ubuntu/app
./deploy.sh
```

---

## 🗑️ Destroying Infrastructure

### When you want to remove everything:

```bash
cd terraform
terraform destroy
```

Type `yes` when prompted.

**⚠️ This will delete:**
- EC2 Instance
- Elastic IP
- Security Group
- VPC and Subnets

---

## 📝 Useful Commands Reference

### Terraform Commands

```bash
terraform init          # Initialize Terraform
terraform plan          # Preview changes
terraform apply         # Apply changes
terraform destroy       # Destroy infrastructure
terraform output        # Show outputs
terraform state list    # List resources
```

### Server Commands

```bash
./deploy.sh            # Deploy/update application
./status.sh            # Check application status
pm2 logs profit-first  # View logs
pm2 restart profit-first # Restart app
pm2 monit              # Monitor resources
sudo systemctl status nginx # Check Nginx
```

### SSH Commands

```bash
# Connect to server
ssh -i profit-first-key.pem ubuntu@YOUR_IP

# Copy files to server
scp -i profit-first-key.pem file.txt ubuntu@YOUR_IP:/home/ubuntu/

# Copy directory to server
scp -r -i profit-first-key.pem ./folder ubuntu@YOUR_IP:/home/ubuntu/
```

---

## 🎯 Quick Start Checklist

- [ ] AWS account setup
- [ ] Terraform installed
- [ ] AWS credentials configured
- [ ] SSH key pair created
- [ ] Run `terraform apply`
- [ ] Note down public IP
- [ ] Upload application code
- [ ] Configure .env file
- [ ] Run `./deploy.sh`
- [ ] Test application
- [ ] Configure DNS
- [ ] Setup SSL (optional)
- [ ] Monitor application

---

## 📞 Support

### Common Issues

1. **Can't SSH:** Check key permissions and security group
2. **App won't start:** Check .env file and logs
3. **Slow performance:** Consider upgrading instance type
4. **Out of disk:** Increase EBS volume size

### Resources

- AWS EC2 Documentation: https://docs.aws.amazon.com/ec2/
- Terraform AWS Provider: https://registry.terraform.io/providers/hashicorp/aws/
- PM2 Documentation: https://pm2.keymetrics.io/
- Nginx Documentation: https://nginx.org/en/docs/

---

## 🎉 Success!

Your Profit First application is now deployed on AWS!

**Access your application:**
- HTTP: http://YOUR_IP
- HTTPS: https://yourdomain.com (after DNS and SSL setup)

**Next steps:**
1. Monitor application performance
2. Set up automated backups
3. Configure monitoring/alerts
4. Optimize for production

---

**Happy Deploying! 🚀**
