# Variables for Terraform configuration

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-south-1" # Mumbai
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "profit-first"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ssh_key_name" {
  description = "Name of SSH key pair in AWS (must exist in AWS)"
  type        = string
  default     = "profit-first-key"
}

variable "domain_name" {
  description = "Your domain name (optional)"
  type        = string
  default     = ""
}

variable "root_volume_size" {
  description = "Size of root volume in GB"
  type        = number
  default     = 20
}
