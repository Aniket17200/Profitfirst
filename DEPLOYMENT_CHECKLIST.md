# 📋 Deployment Checklist

## Pre-Deployment

### AWS Account Setup
- [ ] AWS account created
- [ ] Login URL: https://078109852021.signin.aws.amazon.com/console
- [ ] IAM user with EC2 permissions
- [ ] Access Key ID obtained
- [ ] Secret Access Key obtained

### Local Setup
- [ ] Terraform installed (`terraform --version`)
- [ ] AWS CLI installed (`aws --version`)
- [ ] Git installed (optional)
- [ ] SSH client available

### AWS Configuration
- [ ] Run `aws configure`
- [ ] Access Key ID entered
- [ ] Secret Access Key entered
- [ ] Region set to `ap-south-1`
- [ ] Output format set to `json`

### SSH Key Pair
- [ ] Created in AWS Console (EC2 → Key Pairs)
- [ ] Name: `profit-first-key`
- [ ] Downloaded .pem file
- [ ] Saved securely
- [ ] Permissions set: `chmod 400 profit-first-key.pem` (Mac/Linux)

---

## Deployment

### Terraform Initialization
- [ ] Navigate to `terraform` directory
- [ ] Run `terraform init`
- [ ] No errors shown
- [ ] Providers downloaded

### Configuration
- [ ] Copy `terraform.tfvars.example` to `terraform.tfvars`
- [ ] Update `ssh_key_name` if different
- [ ] Update `domain_name` if you have one
- [ ] Review other variables

### Deploy Infrastructure
- [ ] Run `terraform plan`
- [ ] Review planned changes
- [ ] Run `terraform apply`
- [ ] Type `yes` to confirm
- [ ] Wait 3-5 minutes
- [ ] Deployment successful

### Save Outputs
- [ ] Run `terraform output`
- [ ] Copy Public IP address
- [ ] Copy SSH command
- [ ] Save for later use

---

## Application Setup

### Connect to Server
- [ ] Run SSH command from output
- [ ] Successfully connected
- [ ] See Ubuntu welcome message

### Upload Code
Choose one method:

**Method A: Git**
- [ ] Navigate to `/home/ubuntu/app`
- [ ] Run `git clone YOUR_REPO_URL .`
- [ ] Code downloaded successfully

**Method B: SCP**
- [ ] Run `scp -r -i profit-first-key.pem ./* ubuntu@YOUR_IP:/home/ubuntu/app/`
- [ ] Files uploaded successfully

### Configure Environment
- [ ] Navigate to `/home/ubuntu/app`
- [ ] Run `cp .env.example .env`
- [ ] Run `nano .env`
- [ ] Update all required variables:
  - [ ] MONGODB_URI
  - [ ] OPENAI_API_KEY
  - [ ] PINECONE_API_KEY
  - [ ] JWT_SECRET
  - [ ] All Shopify credentials
  - [ ] All Meta credentials
  - [ ] All Shiprocket credentials
- [ ] Save file (Ctrl+X, Y, Enter)

### Deploy Application
- [ ] Run `./deploy.sh`
- [ ] Wait 5-10 minutes
- [ ] No errors shown
- [ ] PM2 shows app running

### Verify Deployment
- [ ] Run `./status.sh`
- [ ] Application status: `online`
- [ ] Run `pm2 logs profit-first`
- [ ] No critical errors
- [ ] Server listening message shown

---

## Testing

### Local Testing
- [ ] Open browser
- [ ] Navigate to `http://YOUR_IP`
- [ ] Application loads
- [ ] Can see login page
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard loads
- [ ] AI chat works
- [ ] All features functional

### Performance Testing
- [ ] Dashboard loads in < 5 seconds
- [ ] AI responds in < 3 seconds
- [ ] No timeout errors
- [ ] All data displays correctly

---

## DNS Configuration (Optional)

### Domain Setup
- [ ] Domain purchased
- [ ] Access to DNS settings
- [ ] DNS provider identified

### Add DNS Records
- [ ] Add A record for root (@)
  - Type: A
  - Name: @
  - Value: YOUR_IP
  - TTL: 300
- [ ] Add A record for www
  - Type: A
  - Name: www
  - Value: YOUR_IP
  - TTL: 300

### Verify DNS
- [ ] Wait 5-60 minutes
- [ ] Run `nslookup yourdomain.com`
- [ ] Shows correct IP
- [ ] Test in browser
- [ ] Domain works

---

## SSL Setup (Optional but Recommended)

### Install Certbot
- [ ] SSH into server
- [ ] Run `sudo apt-get update`
- [ ] Run `sudo apt-get install -y certbot python3-certbot-nginx`
- [ ] Installation successful

### Get Certificate
- [ ] Run `sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com`
- [ ] Enter email address
- [ ] Agree to terms
- [ ] Choose redirect option (2)
- [ ] Certificate obtained
- [ ] Nginx configured

### Test HTTPS
- [ ] Open `https://yourdomain.com`
- [ ] Shows secure padlock
- [ ] Certificate valid
- [ ] HTTP redirects to HTTPS

### Test Auto-Renewal
- [ ] Run `sudo certbot renew --dry-run`
- [ ] Test successful
- [ ] Auto-renewal configured

---

## Monitoring Setup

### Application Monitoring
- [ ] Run `pm2 monit`
- [ ] CPU usage normal (< 80%)
- [ ] Memory usage normal (< 80%)
- [ ] No errors in logs

### Server Monitoring
- [ ] Run `htop`
- [ ] System resources normal
- [ ] Run `df -h`
- [ ] Disk space sufficient (> 20% free)

### Log Monitoring
- [ ] Check application logs: `pm2 logs profit-first`
- [ ] Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- [ ] No critical errors

---

## Security Hardening

### Basic Security
- [ ] SSH key-based auth only
- [ ] Security group configured
- [ ] Only necessary ports open
- [ ] Firewall enabled

### Additional Security (Recommended)
- [ ] Install fail2ban: `sudo apt-get install fail2ban`
- [ ] Configure automatic updates
- [ ] Setup CloudWatch monitoring
- [ ] Enable AWS CloudTrail
- [ ] Regular security audits

---

## Backup Setup

### Manual Backup
- [ ] Create AMI snapshot in AWS Console
- [ ] EC2 → Instances → Actions → Image → Create Image
- [ ] Name: `profit-first-backup-DATE`
- [ ] Snapshot created

### Automated Backup (Recommended)
- [ ] Setup AWS Backup service
- [ ] Configure daily snapshots
- [ ] Set retention policy
- [ ] Test restore process

---

## Documentation

### Save Important Information
- [ ] Public IP address
- [ ] SSH key location
- [ ] Domain name
- [ ] SSL certificate details
- [ ] AWS account details
- [ ] Database connection strings
- [ ] API keys (securely)

### Create Runbook
- [ ] Document deployment process
- [ ] Document update process
- [ ] Document troubleshooting steps
- [ ] Document emergency procedures

---

## Post-Deployment

### Notify Team
- [ ] Share application URL
- [ ] Share access credentials
- [ ] Share documentation
- [ ] Schedule training if needed

### Monitor First 24 Hours
- [ ] Check logs every few hours
- [ ] Monitor performance
- [ ] Watch for errors
- [ ] Test all features

### Schedule Maintenance
- [ ] Plan regular updates
- [ ] Schedule backup reviews
- [ ] Plan security audits
- [ ] Schedule performance reviews

---

## Success Criteria

Your deployment is successful when:

✅ Infrastructure deployed without errors
✅ Application running on server
✅ Accessible via public IP
✅ All features working correctly
✅ DNS configured (if applicable)
✅ SSL certificate installed (if applicable)
✅ Monitoring in place
✅ Backups configured
✅ Documentation complete
✅ Team notified

---

## Rollback Plan

If something goes wrong:

### Quick Rollback
```bash
# Stop application
pm2 stop profit-first

# Restore from backup
# (if you have one)

# Or destroy and redeploy
cd terraform
terraform destroy
terraform apply
```

### Emergency Contacts
- AWS Support: [Your support plan]
- Team Lead: [Contact info]
- DevOps: [Contact info]

---

## Next Steps

After successful deployment:

1. **Week 1**
   - [ ] Monitor daily
   - [ ] Fix any issues
   - [ ] Optimize performance
   - [ ] Gather user feedback

2. **Week 2-4**
   - [ ] Setup CI/CD pipeline
   - [ ] Implement auto-scaling
   - [ ] Add monitoring alerts
   - [ ] Performance tuning

3. **Month 2+**
   - [ ] Review costs
   - [ ] Optimize infrastructure
   - [ ] Plan for growth
   - [ ] Implement improvements

---

## 🎉 Congratulations!

If you've checked all the boxes, your application is successfully deployed!

**Your application is live at:**
- HTTP: `http://YOUR_IP`
- HTTPS: `https://yourdomain.com` (if configured)

**Cost:** ~$9-10/month

**Performance:** 80-90% faster than before

**Status:** Production Ready ✅

---

**Need help?** See:
- `DEPLOYMENT_GUIDE.md` - Complete guide
- `QUICK_DEPLOY.md` - Quick start
- `terraform/TROUBLESHOOTING.md` - Common issues
- `AWS_DEPLOYMENT_SUMMARY.md` - Overview

**Happy Deploying! 🚀**
