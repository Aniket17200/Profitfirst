# ⚡ Quick Deploy Guide - 5 Minutes

## Prerequisites
- AWS Account: https://078109852021.signin.aws.amazon.com/console
- Terraform installed
- AWS CLI configured

---

## 🚀 Deploy in 5 Steps

### 1️⃣ Create SSH Key in AWS (2 minutes)

1. Go to AWS Console → EC2 → Key Pairs
2. Click "Create key pair"
3. Name: `profit-first-key`
4. Download and save the `.pem` file

---

### 2️⃣ Configure AWS Credentials (1 minute)

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Region: ap-south-1
# Format: json
```

---

### 3️⃣ Deploy Infrastructure (2 minutes)

```bash
cd terraform
terraform init
terraform apply -auto-approve
```

**Wait 2-3 minutes...**

---

### 4️⃣ Get Your IP Address

```bash
terraform output public_ip
```

**Copy this IP address!** Example: `13.232.XXX.XXX`

---

### 5️⃣ Upload Code & Deploy

```bash
# SSH into server
ssh -i profit-first-key.pem ubuntu@YOUR_IP

# Upload your code (choose one method):

# Method A: Git
cd /home/ubuntu/app
git clone YOUR_REPO_URL .

# Method B: SCP (from local machine)
scp -r -i profit-first-key.pem ./* ubuntu@YOUR_IP:/home/ubuntu/app/

# Configure environment
cd /home/ubuntu/app
cp .env.example .env
nano .env  # Update all API keys

# Deploy
./deploy.sh
```

---

## ✅ Done!

**Your app is live at:** `http://YOUR_IP`

---

## 🌐 Add Your Domain (Optional)

### DNS Configuration:

**A Record:**
- Type: A
- Name: @
- Value: YOUR_IP
- TTL: 300

**WWW Record:**
- Type: A
- Name: www
- Value: YOUR_IP
- TTL: 300

---

## 📊 Check Status

```bash
ssh -i profit-first-key.pem ubuntu@YOUR_IP
./status.sh
```

---

## 🔒 Add HTTPS (Optional)

```bash
ssh -i profit-first-key.pem ubuntu@YOUR_IP
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 💰 Monthly Cost

**~$9-10/month** for t3.micro in Mumbai region

---

## 🐛 Troubleshooting

**Can't connect?**
```bash
chmod 400 profit-first-key.pem
```

**App not starting?**
```bash
pm2 logs profit-first
```

**Need help?**
See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## 🗑️ Remove Everything

```bash
cd terraform
terraform destroy -auto-approve
```

---

**That's it! Your app is deployed! 🎉**
