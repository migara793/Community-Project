output "instance_public_ip" {
  value = aws_instance.app_server.public_ip
}


output "instance_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.app_server.public_dns
}

output "react_url" {
  description = "URL to access React app"
  value       = "http://${aws_instance.app_server.public_ip}:${var.react_port}"
}

output "flask_url" {
  description = "URL to access Flask app"
  value       = "http://${aws_instance.app_server.public_ip}:${var.flask_port}"
}