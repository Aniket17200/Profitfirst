# Terraform Configuration for Profit First Application

## Overview

This Terraform configuration deploys a complete infrastructure for the Profit First application on AWS in Mumbai region (ap-south-1).

## What Gets Created

- **VPC** with public subnet
- **EC2 Instance** (t3.micro Ubuntu 22.04)
- **Elastic IP** (static public IP)
- **Security Group** (SSH, HTTP, HTTPS)
- **Internet Gateway** and routing

## Prerequisites

1. **Terraform** installed (v1.0+)
2. **AWS CLI** configured
3. **SSH Key Pair** created in AWS Console

## Quick Start

```bash
# 1. Initialize Terraform
terraform init

# 2. Review the plan
terraform plan

# 3. Deploy
terraform apply

# 4. Get outputs
terraform output
```

## Configuration

### Create terraform.tfvars

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
aws_region       = "ap-south-1"
app_name         = "profit-first"
instance_type    = "t3.micro"
ssh_key_name     = "profit-first-key"  # Must exist in AWS
domain_name      = "yourdomain.com"    # Optional
root_volume_size = 20
```

## Files

- `main.tf` - Main infrastructure configuration
- `variables.tf` - Input variables
- `outputs.tf` - Output values
- `user-data.sh` - Server initialization script
- `terraform.tfvars.example` - Example configuration

## Outputs

After deployment, you'll get:

- **public_ip** - Use this for DNS A record
- **ssh_command** - Command to SSH into server
- **application_url** - URL to access application
- **deployment_instructions** - Next steps

## Usage

### Deploy Infrastructure

```bash
terraform apply
```

### Get Public IP

```bash
terraform output public_ip
```

### SSH into Server

```bash
terraform output ssh_command
# Then run the command shown
```

### Update Infrastructure

```bash
# Modify .tf files
terraform plan
terraform apply
```

### Destroy Infrastructure

```bash
terraform destroy
```

## Cost

Estimated monthly cost: **~$9-10**

- EC2 t3.micro: $7.50
- EBS 20GB: $1.60
- Elastic IP: Free (when attached)

## Security

- SSH key-based authentication
- Security group with minimal ports
- VPC with public subnet
- Elastic IP for static address

## Troubleshooting

### Error: SSH key not found

Create key pair in AWS Console:
1. EC2 → Key Pairs → Create key pair
2. Name: `profit-first-key`
3. Download .pem file

### Error: AWS credentials not configured

```bash
aws configure
```

### Error: Region not available

Ensure you're using `ap-south-1` (Mumbai)

## Support

See `DEPLOYMENT_GUIDE.md` for detailed instructions.
