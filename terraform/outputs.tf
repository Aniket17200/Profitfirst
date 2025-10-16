# Outputs for Terraform

output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "Public IP address - Use this for DNS A record"
  value       = aws_eip.app.public_ip
}

output "elastic_ip" {
  description = "Elastic IP address (static)"
  value       = aws_eip.app.public_ip
}

output "instance_state" {
  description = "Instance state"
  value       = aws_instance.app.instance_state
}

output "ssh_command" {
  description = "SSH command to connect"
  value       = "ssh -i ${var.ssh_key_name}.pem ubuntu@${aws_eip.app.public_ip}"
}

output "application_url" {
  description = "Application URL (HTTP)"
  value       = "http://${aws_eip.app.public_ip}"
}

output "application_url_https" {
  description = "Application URL (HTTPS - after SSL setup)"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "Configure domain first"
}

output "deployment_instructions" {
  description = "Next steps for deployment"
  value       = <<-EOT
    
    ╔════════════════════════════════════════════════════════════════╗
    ║           DEPLOYMENT INSTRUCTIONS                              ║
    ╚════════════════════════════════════════════════════════════════╝
    
    ✅ Infrastructure Created Successfully!
    
    📍 SERVER DETAILS:
       Instance ID: ${aws_instance.app.id}
       Public IP: ${aws_eip.app.public_ip}
       Region: ap-south-1 (Mumbai)
       Instance Type: t3.micro
    
    🔐 STEP 1: Connect to Server
       ssh -i ${var.ssh_key_name}.pem ubuntu@${aws_eip.app.public_ip}
    
    📦 STEP 2: Upload Your Code
       Option A - Using Git:
         cd /home/ubuntu/app
         git clone YOUR_REPO_URL .
       
       Option B - Using SCP:
         scp -r -i ${var.ssh_key_name}.pem ./* ubuntu@${aws_eip.app.public_ip}:/home/ubuntu/app/
    
    ⚙️  STEP 3: Configure Environment
       cd /home/ubuntu/app
       cp .env.example .env
       nano .env
       (Update all API keys and credentials)
    
    🚀 STEP 4: Deploy Application
       ./deploy.sh
    
    🌐 STEP 5: Configure DNS (Point your domain to this IP)
       Type: A Record
       Name: @ (or subdomain)
       Value: ${aws_eip.app.public_ip}
       TTL: 300
    
    📊 STEP 6: Access Your Application
       HTTP: http://${aws_eip.app.public_ip}
       After DNS: http://yourdomain.com
    
    ═══════════════════════════════════════════════════════════════
    
    📝 Useful Commands (run on server):
       ./status.sh          - Check application status
       pm2 logs profit-first - View application logs
       pm2 restart profit-first - Restart application
       sudo systemctl status nginx - Check Nginx status
    
    ═══════════════════════════════════════════════════════════════
  EOT
}

output "dns_configuration" {
  description = "DNS configuration for your domain"
  value       = <<-EOT
    
    ╔════════════════════════════════════════════════════════════════╗
    ║           DNS CONFIGURATION                                    ║
    ╚════════════════════════════════════════════════════════════════╝
    
    Add these records to your domain registrar:
    
    📍 A Record (Root Domain):
       Type: A
       Name: @
       Value: ${aws_eip.app.public_ip}
       TTL: 300
    
    📍 A Record (WWW Subdomain):
       Type: A
       Name: www
       Value: ${aws_eip.app.public_ip}
       TTL: 300
    
    ⏱️  DNS propagation may take 5-60 minutes
    
    ═══════════════════════════════════════════════════════════════
  EOT
}
