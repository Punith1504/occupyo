output "alb_dns_name" {
  description = "The DNS name of the load balancer"
  value       = module.alb.lb_dns_name
}

output "db_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = module.db.db_instance_endpoint
}

output "redis_endpoint" {
  description = "The connection endpoint for ElastiCache Redis"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "secrets_manager_arn" {
  description = "ARN for the Secrets Manager secret"
  value       = aws_secretsmanager_secret.app_secrets.arn
}
