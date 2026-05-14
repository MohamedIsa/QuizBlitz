terraform {
  required_version = ">= 1.6"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for the QuizBlitz domain"
  type        = string
}

variable "server_ip" {
  description = "Origin server IP address"
  type        = string
  sensitive   = true
}

resource "cloudflare_record" "api" {
  zone_id = var.cloudflare_zone_id
  name    = "api"
  content = var.server_ip
  type    = "A"
  proxied = true
}
