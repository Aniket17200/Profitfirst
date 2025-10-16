# 🔑 Create SSH Key Pair - Quick Guide

## Issue

The SSH key pair `profit-first-key` doesn't exist in AWS.

**Error:**
```
The key pair 'profit-first-key' does not exist
```

---

## ✅ Solution: Create SSH Key Pair

You need to create the SSH key pair in AWS Console.

---

## 🚀 Quick Fix (5 minutes)

### Step 1: Login to AWS Console

Go to: https://078109852021.signin.aws.amazon.com/console

### Step 2: Navigate to EC2

1. In the search bar, type **EC2**
2. Click on **EC2** service

### Step 3: Go to Key Pairs

1. In the left sidebar, scroll down to **Network & Security**
2. Click on **Key Pairs**

### Step 4: Create Key Pair

1. Click **Create key pair** button (orange button, top right)
2. Fill in the details:
   - **Name:** `profit-first-key` (exactly this name!)
   - **Key pair type:** RSA
   - **Private key file format:** 
     - Choose **.pem** (for Mac/Linux/Git Bash)
     - Choose **.ppk** (for Windows/PuTTY)
3. Click **Create key pair**

### Step 5: Save the Key File

1. The key file will download automatically
2. **IMPORTANT:** Save it securely!
3. Move it to a safe location (e.g., `C:\Users\YourName\.ssh\`)

### Step 6: Set Permissions (Mac/Linux/Git Bash)

```bash
chmod 400 profit-first-key.pem
```

---

## 🔄 After Creating Key

### Verify Key Exists

```bash
aws ec2 describe-key-pairs --region ap-south-1 --key-names profit-first-key
```

Should return key information.

### Run Terraform Again

```bash
cd terraform
terraform apply
```

Should now work!

---

## 🎯 Alternative: Use Different Key Name

If you already have a key pair with a different name:

### Option 1: Update terraform.tfvars

Create or edit `terraform/terraform.tfvars`:

```hcl
ssh_key_name = "your-existing-key-name"
```

### Option 2: Use Command Line

```bash
terraform apply -var="ssh_key_name=your-existing-key-name"
```

---

## 📋 Step-by-Step with Screenshots

### 1. AWS Console → EC2
![EC2 Console](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/images/EC2_Console.png)

### 2. Key Pairs Menu
- Left sidebar → Network & Security → Key Pairs

### 3. Create Key Pair Form
- Name: `profit-first-key`
- Type: RSA
- Format: .pem (recommended)

### 4. Download and Save
- File downloads automatically
- Save in secure location
- Don't lose this file!

---

## 🐛 Troubleshooting

### Key Already Exists (Different Region)

Keys are region-specific. Make sure you're in **ap-south-1 (Mumbai)**.

```bash
# Check current region
aws configure get region

# Should show: ap-south-1
```

### Can't Download Key Again

AWS only lets you download the private key once. If you lost it:

1. Delete the old key pair
2. Create a new one with the same name
3. Download and save it

### Permission Denied (Mac/Linux)

```bash
chmod 400 profit-first-key.pem
```

---

## ✅ Verification Checklist

After creating the key:

- [ ] Key pair created in AWS Console
- [ ] Key name is exactly `profit-first-key`
- [ ] Region is `ap-south-1` (Mumbai)
- [ ] Private key file downloaded
- [ ] File saved securely
- [ ] Permissions set (Mac/Linux): `chmod 400`
- [ ] Can verify with: `aws ec2 describe-key-pairs`

---

## 🚀 Ready to Deploy

Once key is created:

```bash
cd terraform
terraform apply
```

Type `yes` when prompted.

---

## 💡 Pro Tips

1. **Save the key file** - You can't download it again!
2. **Backup the key** - Store a copy in a secure location
3. **Use .pem format** - Works on all platforms with Git Bash
4. **Set permissions** - Required on Mac/Linux
5. **One key per region** - Keys are region-specific

---

## 📝 Key File Locations

### Recommended Locations:

**Windows:**
```
C:\Users\YourName\.ssh\profit-first-key.pem
```

**Mac/Linux:**
```
~/.ssh/profit-first-key.pem
```

### Using the Key:

```bash
# SSH into server
ssh -i path/to/profit-first-key.pem ubuntu@YOUR_IP

# SCP files
scp -i path/to/profit-first-key.pem file.txt ubuntu@YOUR_IP:/home/ubuntu/
```

---

## 🔐 Security Best Practices

1. **Never share** your private key
2. **Never commit** to Git
3. **Set proper permissions** (400 on Mac/Linux)
4. **Keep backups** in secure location
5. **Use different keys** for different environments

---

## 📞 Need Help?

### List Existing Keys

```bash
aws ec2 describe-key-pairs --region ap-south-1
```

### Delete Old Key (if needed)

```bash
aws ec2 delete-key-pair --region ap-south-1 --key-name profit-first-key
```

### Create Key via CLI (Alternative)

```bash
aws ec2 create-key-pair \
  --region ap-south-1 \
  --key-name profit-first-key \
  --query 'KeyMaterial' \
  --output text > profit-first-key.pem

chmod 400 profit-first-key.pem
```

---

## ✅ Success!

Once you see the key in AWS Console:

1. ✅ Key pair created
2. ✅ Private key downloaded
3. ✅ File saved securely
4. ✅ Ready to deploy

Run:
```bash
cd terraform
terraform apply
```

---

**Your SSH key is ready! 🎉**

Now you can deploy your infrastructure!
