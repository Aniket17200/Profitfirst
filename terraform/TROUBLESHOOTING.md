# Terraform Troubleshooting Guide

## Common Errors and Solutions

### ✅ Error: Duplicate variable declaration

**Error Message:**
```
Error: Duplicate variable declaration
A variable named "domain_name" was already declared
```

**Solution:**
This has been fixed. Variables are now only declared in `variables.tf`.

---

### Error: SSH key not found

**Error Message:**
```
Error: InvalidKeyPair.NotFound
The key pair 'profit-first-key' does not exist
```

**Solution Option 1: Create via AWS Console**
1. Go to AWS Console → EC2 → Key Pairs
2. Click "Create key pair"
3. Name: `profit-first-key`
4. Type: RSA
5. Format: .pem
6. Download the .pem file
7. Save securely
8. Run terraform apply again

**Solution Option 2: Create via PowerShell Script**
```powershell
.\create-ssh-key.ps1
```

**Solution Option 3: Create via AWS CLI**
```bash
aws ec2 create-key-pair \
  --region ap-south-1 \
  --key-name profit-first-key \
  --query 'KeyMaterial' \
  --output text > profit-first-key.pem

chmod 400 profit-first-key.pem
```

**See:** `CREATE_SSH_KEY.md` for detailed guide

---

### Error: AWS credentials not configured

**Error Message:**
```
Error: No valid credential sources found
```

**Solution:**
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Region: ap-south-1
# Format: json
```

---

### Error: Region not available

**Error Message:**
```
Error: error configuring Terraform AWS Provider
```

**Solution:**
Ensure you're using Mumbai region:
```bash
export AWS_DEFAULT_REGION=ap-south-1
```

---

### Error: Insufficient permissions

**Error Message:**
```
Error: UnauthorizedOperation
```

**Solution:**
Your IAM user needs these permissions:
- EC2 (full access)
- VPC (full access)
- ElasticIP (full access)

---

### Error: Instance limit exceeded

**Error Message:**
```
Error: InstanceLimitExceeded
```

**Solution:**
1. Check your EC2 instance limits in AWS Console
2. Request limit increase if needed
3. Or terminate unused instances

---

### Error: Terraform state locked

**Error Message:**
```
Error: Error acquiring the state lock
```

**Solution:**
```bash
# Force unlock (use carefully)
terraform force-unlock LOCK_ID
```

---

### Error: Resource already exists

**Error Message:**
```
Error: resource already exists
```

**Solution:**
```bash
# Import existing resource
terraform import aws_instance.app i-1234567890abcdef0

# Or destroy and recreate
terraform destroy
terraform apply
```

---

## Validation Commands

### Check Terraform syntax

```bash
terraform fmt
terraform validate
```

### Preview changes

```bash
terraform plan
```

### Check current state

```bash
terraform state list
terraform show
```

---

## Clean Start

If you want to start fresh:

```bash
# Remove state files
rm -rf .terraform
rm terraform.tfstate*

# Reinitialize
terraform init
terraform apply
```

---

## Getting Help

### Show outputs

```bash
terraform output
```

### Show specific output

```bash
terraform output public_ip
```

### Debug mode

```bash
TF_LOG=DEBUG terraform apply
```

---

## Quick Fixes

### Refresh state

```bash
terraform refresh
```

### Recreate specific resource

```bash
terraform taint aws_instance.app
terraform apply
```

### Update dependencies

```bash
terraform init -upgrade
```

---

## Support

For more help, see:
- `DEPLOYMENT_GUIDE.md`
- `QUICK_DEPLOY.md`
- Terraform docs: https://www.terraform.io/docs
