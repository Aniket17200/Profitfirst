#!/bin/bash
# Script to add required IAM permissions for Terraform deployment
# Run this with admin AWS credentials

USER_NAME="Aniket17"
ACCOUNT_ID="078109852021"

echo "=========================================="
echo "Adding IAM Permissions for Terraform"
echo "=========================================="
echo ""
echo "User: $USER_NAME"
echo "Account: $ACCOUNT_ID"
echo ""

# Check if user has admin permissions
echo "Checking AWS credentials..."
aws sts get-caller-identity
if [ $? -ne 0 ]; then
    echo "Error: AWS credentials not configured or invalid"
    exit 1
fi

echo ""
echo "Adding EC2 Full Access policy..."
aws iam attach-user-policy \
    --user-name $USER_NAME \
    --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess

if [ $? -eq 0 ]; then
    echo "✓ EC2 Full Access added"
else
    echo "✗ Failed to add EC2 Full Access"
fi

echo ""
echo "Adding VPC Full Access policy..."
aws iam attach-user-policy \
    --user-name $USER_NAME \
    --policy-arn arn:aws:iam::aws:policy/AmazonVPCFullAccess

if [ $? -eq 0 ]; then
    echo "✓ VPC Full Access added"
else
    echo "✗ Failed to add VPC Full Access"
fi

echo ""
echo "=========================================="
echo "Verifying permissions..."
echo "=========================================="
echo ""

aws iam list-attached-user-policies --user-name $USER_NAME

echo ""
echo "=========================================="
echo "Done!"
echo "=========================================="
echo ""
echo "User $USER_NAME now has the required permissions."
echo "You can now run: terraform apply"
echo ""
