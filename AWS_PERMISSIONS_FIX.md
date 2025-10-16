# 🔐 AWS Permissions Fix Guide

## Issue

Your IAM user `Aniket17` doesn't have the required EC2 permissions.

**Error:**
```
User: arn:aws:iam::078109852021:user/Aniket17 is not authorized to perform: ec2:DescribeImages
```

---

## ✅ Solution: Add IAM Permissions

You need to add EC2 permissions to your IAM user.

---

## 🔧 Option 1: Using AWS Console (Recommended)

### Step 1: Login to AWS Console

1. Go to: https://078109852021.signin.aws.amazon.com/console
2. Login with your credentials
3. Navigate to **IAM** service

### Step 2: Find Your User

1. Click **Users** in the left menu
2. Search for and click on **Aniket17**

### Step 3: Add Permissions

**Method A: Attach Existing Policy (Easiest)**

1. Click **Add permissions** button
2. Click **Attach policies directly**
3. Search for and select these policies:
   - ✅ **AmazonEC2FullAccess**
   - ✅ **AmazonVPCFullAccess**
4. Click **Next**
5. Click **Add permissions**

**Method B: Create Custom Policy (More Secure)**

1. Click **Add permissions** → **Create inline policy**
2. Click **JSON** tab
3. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "elasticloadbalancing:*",
        "cloudwatch:*",
        "autoscaling:*",
        "iam:CreateServiceLinkedRole"
      ],
      "Resource": "*"
    }
  ]
}
```

4. Click **Review policy**
5. Name: `TerraformEC2Access`
6. Click **Create policy**

### Step 4: Verify Permissions

1. Go back to user **Aniket17**
2. Click **Permissions** tab
3. Verify the policies are attached

---

## 🔧 Option 2: Using AWS CLI

If you have admin access, run these commands:

### Attach Managed Policies

```bash
# Attach EC2 Full Access
aws iam attach-user-policy \
  --user-name Aniket17 \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess

# Attach VPC Full Access
aws iam attach-user-policy \
  --user-name Aniket17 \
  --policy-arn arn:aws:iam::aws:policy/AmazonVPCFullAccess
```

### Or Create Custom Policy

```bash
# Create policy file
cat > terraform-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "elasticloadbalancing:*",
        "cloudwatch:*",
        "autoscaling:*",
        "iam:CreateServiceLinkedRole"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Create policy
aws iam create-policy \
  --policy-name TerraformEC2Access \
  --policy-document file://terraform-policy.json

# Attach to user
aws iam attach-user-policy \
  --user-name Aniket17 \
  --policy-arn arn:aws:iam::078109852021:policy/TerraformEC2Access
```

---

## 📋 Required Permissions for Terraform

Your IAM user needs these permissions:

### EC2 Permissions
- ✅ `ec2:DescribeImages` (to find Ubuntu AMI)
- ✅ `ec2:RunInstances` (to create EC2 instance)
- ✅ `ec2:DescribeInstances` (to check instance status)
- ✅ `ec2:TerminateInstances` (to destroy resources)
- ✅ `ec2:CreateTags` (to tag resources)
- ✅ `ec2:DescribeSecurityGroups` (for security groups)
- ✅ `ec2:CreateSecurityGroup` (to create security group)
- ✅ `ec2:AuthorizeSecurityGroupIngress` (to add rules)
- ✅ `ec2:AllocateAddress` (for Elastic IP)
- ✅ `ec2:AssociateAddress` (to attach Elastic IP)

### VPC Permissions
- ✅ `ec2:CreateVpc` (to create VPC)
- ✅ `ec2:CreateSubnet` (to create subnet)
- ✅ `ec2:CreateInternetGateway` (for internet access)
- ✅ `ec2:CreateRouteTable` (for routing)
- ✅ `ec2:DescribeVpcs` (to check VPC)
- ✅ `ec2:DescribeSubnets` (to check subnets)

---

## 🎯 Recommended IAM Policies

### For Development/Testing
Use managed policies:
- **AmazonEC2FullAccess**
- **AmazonVPCFullAccess**

### For Production
Create a custom policy with only required permissions (see Option 2 above).

---

## ✅ Verify Permissions

After adding permissions, verify they work:

```bash
# Test EC2 permissions
aws ec2 describe-images --owners 099720109477 --region ap-south-1 --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" --query 'Images[0].ImageId'

# Should return an AMI ID like: ami-0a7cf821b91bcccbc
```

If this works, your permissions are correct!

---

## 🔄 After Adding Permissions

### Step 1: Verify AWS CLI

```bash
aws sts get-caller-identity
```

Should show:
```json
{
    "UserId": "...",
    "Account": "078109852021",
    "Arn": "arn:aws:iam::078109852021:user/Aniket17"
}
```

### Step 2: Test Terraform

```bash
cd terraform
terraform plan
```

Should now work without permission errors!

### Step 3: Deploy

```bash
terraform apply
```

---

## 🐛 Still Having Issues?

### Check Current Permissions

```bash
# List attached policies
aws iam list-attached-user-policies --user-name Aniket17

# List inline policies
aws iam list-user-policies --user-name Aniket17
```

### Common Issues

**Issue: "Access Denied"**
- Solution: Contact AWS account administrator
- They need to add permissions to your user

**Issue: "Cannot attach policy"**
- Solution: You need admin permissions to modify IAM
- Ask account owner to add permissions

**Issue: "Policy limit exceeded"**
- Solution: Consolidate policies or use groups

---

## 👥 Alternative: Use IAM Role (Advanced)

If you can't modify user permissions, ask admin to:

1. Create an IAM role with EC2 permissions
2. Allow your user to assume that role
3. Use role credentials with Terraform

---

## 📞 Need Help from Admin?

Send this to your AWS account administrator:

```
Hi,

I need EC2 and VPC permissions to deploy infrastructure with Terraform.

Please attach these policies to my IAM user (Aniket17):
- AmazonEC2FullAccess
- AmazonVPCFullAccess

Or create a custom policy with these permissions:
- ec2:* (all EC2 actions)
- elasticloadbalancing:*
- cloudwatch:*
- autoscaling:*

Account: 078109852021
User: Aniket17
Region: ap-south-1 (Mumbai)

Thank you!
```

---

## ✅ Success Checklist

After fixing permissions:

- [ ] Can run `aws ec2 describe-images`
- [ ] Can run `terraform plan` without errors
- [ ] Can run `terraform apply` successfully
- [ ] EC2 instance created
- [ ] Elastic IP allocated
- [ ] Can SSH into server

---

## 🎉 Once Permissions Are Fixed

Run the deployment:

```bash
cd terraform
terraform init
terraform apply
```

Type `yes` when prompted.

---

## 💡 Pro Tips

1. **Use IAM Groups** - Add user to a group with permissions
2. **Principle of Least Privilege** - Only grant needed permissions
3. **Use Roles for EC2** - EC2 instances should use roles, not keys
4. **Enable MFA** - Add multi-factor authentication for security
5. **Regular Audits** - Review permissions periodically

---

## 📚 Additional Resources

- AWS IAM Documentation: https://docs.aws.amazon.com/iam/
- Terraform AWS Provider: https://registry.terraform.io/providers/hashicorp/aws/
- AWS Policy Generator: https://awspolicygen.s3.amazonaws.com/policygen.html

---

**After fixing permissions, you'll be ready to deploy! 🚀**
