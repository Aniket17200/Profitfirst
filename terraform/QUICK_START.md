# ⚡ Terraform Quick Start

## ✅ Issues Fixed
- Duplicate variable declarations - FIXED
- Duplicate output definitions - FIXED
- Ready to deploy!

---

## 🚀 Deploy in 4 Commands

### 1. Initialize Terraform
```bash
terraform init
```

### 2. Review Plan
```bash
terraform plan
```

### 3. Deploy
```bash
terraform apply
```
Type `yes` when prompted.

### 4. Get IP Address
```bash
terraform output public_ip
```

---

## 📋 Prerequisites

Before running terraform:

1. **AWS Account**
   - Login: https://078109852021.signin.aws.amazon.com/console
   - Region: ap-south-1 (Mumbai)

2. **AWS Credentials**
   ```bash
   aws configure
   # Access Key ID: YOUR_KEY
   # Secret Access Key: YOUR_SECRET
   # Region: ap-south-1
   # Format: json
   ```

3. **SSH Key Pair**
   - Create in AWS Console: EC2 → Key Pairs
   - Name: `profit-first-key`
   - Download .pem file
   - Save securely

---

## 🎯 After Deployment

### Connect to Server
```bash
# Get SSH command
terraform output ssh_command

# Connect
ssh -i profit-first-key.pem ubuntu@YOUR_IP
```

### Upload Code
```bash
# Method 1: Git
cd /home/ubuntu/app
git clone YOUR_REPO_URL .

# Method 2: SCP (from local machine)
scp -r -i profit-first-key.pem ./* ubuntu@YOUR_IP:/home/ubuntu/app/
```

### Configure & Deploy
```bash
cd /home/ubuntu/app
cp .env.example .env
nano .env  # Update all variables
./deploy.sh
```

---

## 🌐 DNS Setup

Add A record to your domain:

```
Type: A
Name: @
Value: YOUR_IP (from terraform output)
TTL: 300
```

---

## 🐛 Troubleshooting

### Error: SSH key not found
Create key in AWS Console first

### Error: AWS credentials not configured
Run `aws configure`

### Error: Terraform not initialized
Run `terraform init`

---

## 📚 More Help

- Complete Guide: `../DEPLOYMENT_GUIDE.md`
- Troubleshooting: `TROUBLESHOOTING.md`
- Checklist: `../DEPLOYMENT_CHECKLIST.md`

---

## 💰 Cost

**~$9-10/month** for t3.micro in Mumbai

---

## 🗑️ Remove Everything

```bash
terraform destroy
```

---

**Ready to deploy! 🚀**
