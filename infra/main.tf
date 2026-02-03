terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_eks_cluster" "cluster" {
  name = var.eks_cluster_name
}

data "aws_eks_cluster_auth" "cluster" {
  name = var.eks_cluster_name
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.cluster.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.cluster.token
  }
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "eks_cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "slo-platform-cluster"
}

variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
  default     = "slo-platform"
}

variable "domain" {
  description = "Domain for the platform"
  type        = string
  default     = "slo-platform.example.com"
}

# Create namespace
resource "kubernetes_namespace" "slo_platform" {
  metadata {
    name = var.namespace
    labels = {
      name = var.namespace
    }
  }
}

# PostgreSQL via Helm
resource "helm_release" "postgresql" {
  name       = "postgresql"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  namespace  = kubernetes_namespace.slo_platform.metadata[0].name
  version    = "12.1.9"

  set {
    name  = "auth.postgresPassword"
    value = "slo-pass"
  }

  set {
    name  = "auth.username"
    value = "slo-user"
  }

  set {
    name  = "auth.database"
    value = "slo_platform"
  }

  set {
    name  = "primary.persistence.size"
    value = "20Gi"
  }

  set {
    name  = "primary.resources.requests.memory"
    value = "256Mi"
  }

  set {
    name  = "primary.resources.requests.cpu"
    value = "250m"
  }

  set {
    name  = "primary.resources.limits.memory"
    value = "512Mi"
  }

  set {
    name  = "primary.resources.limits.cpu"
    value = "500m"
  }
}

# Prometheus via Helm
resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = kubernetes_namespace.slo_platform.metadata[0].name
  version    = "45.1.0"

  set {
    name  = "prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage"
    value = "50Gi"
  }

  set {
    name  = "grafana.adminPassword"
    value = "admin"
  }

  set {
    name  = "grafana.ingress.enabled"
    value = "true"
  }

  set {
    name  = "grafana.ingress.hosts[0].host"
    value = "grafana.${var.domain}"
  }

  set {
    name  = "prometheus.ingress.enabled"
    value = "true"
  }

  set {
    name  = "prometheus.ingress.hosts[0].host"
    value = "prometheus.${var.domain}"
  }
}

# SLO Platform Backend ConfigMap
resource "kubernetes_config_map" "backend_config" {
  metadata {
    name      = "backend-config"
    namespace = kubernetes_namespace.slo_platform.metadata[0].name
  }

  data = {
    "database_url" = "postgres://slo-user:slo-pass@postgresql:5432/slo_platform?sslmode=disable"
    "prometheus_url" = "http://prometheus-server.${kubernetes_namespace.slo_platform.metadata[0].name}.svc.cluster.local"
    "jwt_secret" = "production-secret-key-change-me"
    "server_port" = "8080"
    "environment" = "production"
  }
}

# SLO Platform Backend Deployment
resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "slo-platform-backend"
    namespace = kubernetes_namespace.slo_platform.metadata[0].name
    labels = {
      app = "slo-platform-backend"
    }
  }

  spec {
    replicas = 3

    selector {
      match_labels = {
        app = "slo-platform-backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "slo-platform-backend"
        }
      }

      spec {
        container {
          name  = "backend"
          image = "slo-platform/backend:latest"
          port {
            container_port = 8080
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.backend_config.metadata[0].name
            }
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

          liveness_probe {
            http_get {
              path = "/api/v1/health"
              port = 8080
            }
            initial_delay_seconds = 30
            period_seconds        = 10
          }

          readiness_probe {
            http_get {
              path = "/api/v1/health"
              port = 8080
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }
      }
    }
  }
}

# SLO Platform Backend Service
resource "kubernetes_service" "backend" {
  metadata {
    name      = "slo-platform-backend"
    namespace = kubernetes_namespace.slo_platform.metadata[0].name
  }

  spec {
    selector = {
      app = "slo-platform-backend"
    }

    port {
      port        = 8080
      target_port = 8080
    }

    type = "ClusterIP"
  }
}

# SLO Platform Frontend Deployment
resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "slo-platform-frontend"
    namespace = kubernetes_namespace.slo_platform.metadata[0].name
    labels = {
      app = "slo-platform-frontend"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "slo-platform-frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "slo-platform-frontend"
        }
      }

      spec {
        container {
          name  = "frontend"
          image = "slo-platform/frontend:latest"
          port {
            container_port = 3000
          }

          env {
            name  = "REACT_APP_API_URL"
            value = "https://api.${var.domain}/api/v1"
          }

          resources {
            requests = {
              cpu    = "50m"
              memory = "64Mi"
            }
            limits = {
              cpu    = "200m"
              memory = "256Mi"
            }
          }

          liveness_probe {
            http_get {
              path = "/"
              port = 3000
            }
            initial_delay_seconds = 30
            period_seconds        = 10
          }

          readiness_probe {
            http_get {
              path = "/"
              port = 3000
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }
      }
    }
  }
}

# SLO Platform Frontend Service
resource "kubernetes_service" "frontend" {
  metadata {
    name      = "slo-platform-frontend"
    namespace = kubernetes_namespace.slo_platform.metadata[0].name
  }

  spec {
    selector = {
      app = "slo-platform-frontend"
    }

    port {
      port        = 3000
      target_port = 3000
    }

    type = "ClusterIP"
  }
}

# Ingress for API
resource "kubernetes_ingress_v1" "api" {
  metadata {
    name      = "slo-platform-api"
    namespace = kubernetes_namespace.slo_platform.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.class" = "nginx"
      "cert-manager.io/cluster-issuer" = "letsencrypt-prod"
      "nginx.ingress.kubernetes.io/ssl-redirect" = "true"
    }
  }

  spec {
    tls {
      hosts       = ["api.${var.domain}"]
      secret_name = "api-tls"
    }

    rule {
      host = "api.${var.domain}"
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.backend.metadata[0].name
              port {
                number = 8080
              }
            }
          }
        }
      }
    }
  }
}

# Ingress for Frontend
resource "kubernetes_ingress_v1" "frontend" {
  metadata {
    name      = "slo-platform-frontend"
    namespace = kubernetes_namespace.slo_platform.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.class" = "nginx"
      "cert-manager.io/cluster-issuer" = "letsencrypt-prod"
      "nginx.ingress.kubernetes.io/ssl-redirect" = "true"
    }
  }

  spec {
    tls {
      hosts       = [var.domain]
      secret_name = "frontend-tls"
    }

    rule {
      host = var.domain
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.frontend.metadata[0].name
              port {
                number = 3000
              }
            }
          }
        }
      }
    }
  }
}

# Horizontal Pod Autoscaler for Backend
resource "kubernetes_horizontal_pod_autoscaler" "backend_hpa" {
  metadata {
    name      = "slo-platform-backend-hpa"
    namespace = kubernetes_namespace.slo_platform.metadata[0].name
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.backend.metadata[0].name
    }

    min_replicas = 3
    max_replicas = 10

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 70
        }
      }
    }
  }
}

# Horizontal Pod Autoscaler for Frontend
resource "kubernetes_horizontal_pod_autoscaler" "frontend_hpa" {
  metadata {
    name      = "slo-platform-frontend-hpa"
    namespace = kubernetes_namespace.slo_platform.metadata[0].name
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.frontend.metadata[0].name
    }

    min_replicas = 2
    max_replicas = 5

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 70
        }
      }
    }
  }
}

# Outputs
output "frontend_url" {
  description = "Frontend URL"
  value       = "https://${var.domain}"
}

output "api_url" {
  description = "API URL"
  value       = "https://api.${var.domain}/api/v1"
}

output "prometheus_url" {
  description = "Prometheus URL"
  value       = "https://prometheus.${var.domain}"
}

output "grafana_url" {
  description = "Grafana URL"
  value       = "https://grafana.${var.domain}"
}
