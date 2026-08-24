variable "aws_region" {
  description = "AWS region for deployment"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  default     = "occupyo-backend"
}

variable "environment" {
  description = "Deployment environment (e.g., prod, staging)"
  default     = "prod"
}

variable "db_username" {
  description = "PostgreSQL Master Username"
  default     = "occupyo_admin"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  default     = "10.0.0.0/16"
}
