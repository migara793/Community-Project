terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket         = "my-tf-state-bucket-migara123 "   # Update with your bucket name
    key            = "aws/ec2-deploy/terraform.tfstate"
    region         = "us-east-1"

    encrypt        = true
    use_lockfile   = true  
  }
}

provider "aws" {
  region = var.region
}



resource "aws_key_pair" "deployer" {
  key_name   = var.key_name
  public_key = var.public_key
}

resource "aws_security_group" "maingroup" {
  name        = "main-sg"
  description = "Allow web, SSH, and application traffic"

  # SSH - Consider restricting to your IP
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Consider changing to your IP: ["YOUR_IP/32"]
  }

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # React app port
  ingress {
    from_port   = var.react_port
    to_port     = var.react_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Flask app port
  ingress {
    from_port   = var.flask_port
    to_port     = var.flask_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "main-security-group"
  }
}
resource "aws_iam_instance_profile" "ec2-profile" {
  name = "ec2-profile"
  role = "EC2-ECR-AUTH"  # Must match the role you created
}

resource "aws_instance" "app_server" {
  ami                    = "ami-020cba7c55df1f615"  # Ubuntu 22.04 - verify this AMI ID is current
  instance_type          = "t2.micro"
  key_name               = aws_key_pair.deployer.key_name
  vpc_security_group_ids = [aws_security_group.maingroup.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  
  user_data = <<-EOF
              #!/bin/bash
              
              # Update system
              sudo apt-get update -y
              
              # Install Docker
              sudo apt-get install -y docker.io
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu
              
              # Wait for Docker to initialize
              sleep 30
              
              # Pull and run containers
              sudo docker pull migara37/community-client:latest
              sudo docker pull migara37/community-server:latest
              
              # Run Flask backend
              sudo docker run -d --name flask-backend -p ${var.flask_port}:5000 migara37/community-server:latest
              
              # Run React frontend
              sudo docker run -d --name react-frontend -p ${var.react_port}:3000 migara37/community-client:latest
              EOF

  tags = {
    Name = "FlaskReactAppServer"
  }
}