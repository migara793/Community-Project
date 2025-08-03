variable "key_name" {
  description = "Name of the SSH key pair"
  type        = string
}

variable "public_key" {
  description = "Public SSH key"
  type        = string
}

variable "private_key" {
  description = "Private SSH key"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "react_port" {
  description = "React app port"
  type        = number
  default     = 3000
}

variable "flask_port" {
  description = "Flask app port"
  type        = number
  default     = 5000
}

