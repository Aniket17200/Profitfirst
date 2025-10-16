# 🔑 Create SSH Key - Windows PowerShell Guide

## ⚡ Quick Fix for Windows

You're in PowerShell, so use the PowerShell script:

```powershell
.\create-ssh-key.ps1
```

That's it! The script will:
1. ✅ Create the key in AWS
2. ✅ Download the private key
3. ✅ Save it as `profit-first-key.pem`

---

## 🔧 Alternative: Manual PowerShell Command

If you want to do it manually in PowerShell:

```powershell
aws ec2 create-key-pair --region ap-south-1 --key-name profit-first-key --query 'KeyMaterial' --output text | Out-File -FilePath profit-first-key.pem -Encoding ASCII -NoNewline
```

**Note:** This is ONE command (no backslashes in PowerShell)

---

## 📋 Step-by-Step

### Step 1: Run the Script

```powershell
.\create-ssh-key.ps1
```

### Step 2: Verify Key Created

```powershell
aws ec2 describe-key-pairs --region ap-south-1 --key-names profit-first-key
```

Should show key information.

### Step 3: Deploy with Terraform

```powershell
terraform apply
```

---

## 🐛 If Script Doesn't Work

### Option 1: Create in AWS Console (Easiest)

1. Open browser: https://078109852021.signin.aws.amazon.com/console
2. Go to **EC2** service
3. Click **Key Pairs** (left sidebar under Network & Security)
4. Click **Create key pair** button
5. Fill in:
   - Name: `profit-first-key`
   - Type: RSA
   - Format: .pem
6. Click **Create key pair**
7. Save the downloaded file in the `terraform` folder

### Option 2: Use AWS CLI (Single Line)

```powershell
aws ec2 create-key-pair --region ap-south-1 --key-name profit-first-key --query 'KeyMaterial' --output text | Out-File -FilePath profit-first-key.pem -Encoding ASCII -NoNewline
```

---

## ✅ Verify It Worked

### Check if key exists in AWS:

```powershell
aws ec2 describe-key-pairs --region ap-south-1
```

Should list `profit-first-key`.

### Check if file was created:

```powershell
dir profit-first-key.pem
```

Should show the file.

---

## 🚀 After Key is Created

Run Terraform:

```powershell
terraform apply
```

Type `yes` when prompted.

---

## 💡 Why the Error Happened

You tried to run a **bash command** in **PowerShell**:

**Bash (Linux/Mac):**
```bash
aws ec2 create-key-pair \
  --region ap-south-1 \
  --key-name profit-first-key \
  --query 'KeyMaterial' \
  --output text > profit-first-key.pem
```

**PowerShell (Windows):**
```powershell
aws ec2 create-key-pair --region ap-south-1 --key-name profit-first-key --query 'KeyMaterial' --output text | Out-File -FilePath profit-first-key.pem -Encoding ASCII -NoNewline
```

Key differences:
- ❌ No backslashes (`\`) in PowerShell
- ❌ Use `|` instead of `>`
- ❌ Use `Out-File` instead of redirect

---

## 📝 Quick Reference

### PowerShell Commands:

```powershell
# Create key (use script)
.\create-ssh-key.ps1

# Or manual command
aws ec2 create-key-pair --region ap-south-1 --key-name profit-first-key --query 'KeyMaterial' --output text | Out-File -FilePath profit-first-key.pem -Encoding ASCII -NoNewline

# Verify key
aws ec2 describe-key-pairs --region ap-south-1 --key-names profit-first-key

# Check file
dir profit-first-key.pem

# Deploy
terraform apply
```

---

## ✅ Success Checklist

- [ ] Key created in AWS
- [ ] File `profit-first-key.pem` exists
- [ ] Can verify with `aws ec2 describe-key-pairs`
- [ ] Ready to run `terraform apply`

---

**Use the PowerShell script for easiest setup! 🚀**

```powershell
.\create-ssh-key.ps1
```
