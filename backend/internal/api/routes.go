package api

import (
	"net/http"
	"strconv"
	"time"

	"slo-platform/internal/models"
	"slo-platform/internal/services"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, serviceRegistry *services.ServiceRegistry, sloService *services.SLOService, metricsService *services.MetricsService) {
	api := router.Group("/api/v1")
	
	// Service endpoints
	api.POST("/services", createService(serviceRegistry))
	api.GET("/services", listServices(serviceRegistry))
	api.GET("/services/:id", getService(serviceRegistry))
	api.PUT("/services/:id", updateService(serviceRegistry))
	api.DELETE("/services/:id", deleteService(serviceRegistry))
	
	// SLO endpoints
	api.POST("/slos", createSLO(sloService))
	api.GET("/services/:serviceId/slos", listSLOs(sloService))
	api.GET("/slos/:id", getSLO(sloService))
	api.PUT("/slos/:id", updateSLO(sloService))
	api.DELETE("/slos/:id", deleteSLO(sloService))
	
	// Status and monitoring endpoints
	api.GET("/services/:id/slo-status", getSLOStatus(sloService))
	api.GET("/services/:id/error-budget", getErrorBudget(sloService))
	api.GET("/deploy-check", checkDeploySafety(sloService))
	
	// Metrics ingestion
	api.POST("/metrics/ingest", ingestMetrics(metricsService))
	
	// Health check
	api.GET("/health", healthCheck)
}

func createService(serviceRegistry *services.ServiceRegistry) gin.HandlerFunc {
	return func(c *gin.Context) {
		var service models.Service
		if err := c.ShouldBindJSON(&service); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		
		if err := serviceRegistry.CreateService(&service); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusCreated, service)
	}
}

func listServices(serviceRegistry *services.ServiceRegistry) gin.HandlerFunc {
	return func(c *gin.Context) {
		services, err := serviceRegistry.ListServices()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusOK, services)
	}
}

func getService(serviceRegistry *services.ServiceRegistry) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
			return
		}
		
		service, err := serviceRegistry.GetService(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
			return
		}
		
		c.JSON(http.StatusOK, service)
	}
}

func updateService(serviceRegistry *services.ServiceRegistry) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
			return
		}
		
		var service models.Service
		if err := c.ShouldBindJSON(&service); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		
		service.ID = uint(id)
		if err := serviceRegistry.UpdateService(&service); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusOK, service)
	}
}

func deleteService(serviceRegistry *services.ServiceRegistry) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
			return
		}
		
		if err := serviceRegistry.DeleteService(uint(id)); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusNoContent, nil)
	}
}

func createSLO(sloService *services.SLOService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var slo models.SLO
		if err := c.ShouldBindJSON(&slo); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		
		if err := sloService.CreateSLO(&slo); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusCreated, slo)
	}
}

func listSLOs(sloService *services.SLOService) gin.HandlerFunc {
	return func(c *gin.Context) {
		serviceID, err := strconv.ParseUint(c.Param("serviceId"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
			return
		}
		
		slos, err := sloService.ListSLOs(uint(serviceID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusOK, slos)
	}
}

func getSLO(sloService *services.SLOService) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid SLO ID"})
			return
		}
		
		slo, err := sloService.GetSLO(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "SLO not found"})
			return
		}
		
		c.JSON(http.StatusOK, slo)
	}
}

func updateSLO(sloService *services.SLOService) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid SLO ID"})
			return
		}
		
		var slo models.SLO
		if err := c.ShouldBindJSON(&slo); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		
		slo.ID = uint(id)
		if err := sloService.CreateSLO(&slo); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusOK, slo)
	}
}

func deleteSLO(sloService *services.SLOService) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid SLO ID"})
			return
		}
		
		// Note: This would need to be implemented in SLOService
		c.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented"})
	}
}

func getSLOStatus(sloService *services.SLOService) gin.HandlerFunc {
	return func(c *gin.Context) {
		serviceID, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
			return
		}
		
		slos, err := sloService.ListSLOs(uint(serviceID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		var statuses []interface{}
		for _, slo := range slos {
			status, err := sloService.CalculateSLOStatus(slo.ID)
			if err != nil {
				continue
			}
			statuses = append(statuses, status)
		}
		
		c.JSON(http.StatusOK, statuses)
	}
}

func getErrorBudget(sloService *services.SLOService) gin.HandlerFunc {
	return func(c *gin.Context) {
		serviceID, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
			return
		}
		
		slos, err := sloService.ListSLOs(uint(serviceID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		var budgets []interface{}
		for _, slo := range slos {
			budget, err := sloService.GetErrorBudget(slo.ID)
			if err != nil {
				continue
			}
			budgets = append(budgets, budget)
		}
		
		c.JSON(http.StatusOK, budgets)
	}
}

func checkDeploySafety(sloService *services.SLOService) gin.HandlerFunc {
	return func(c *gin.Context) {
		serviceName := c.Query("service")
		environment := c.Query("env")
		
		if serviceName == "" || environment == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "service and env query parameters are required"})
			return
		}
		
		check, err := sloService.CheckDeploySafety(serviceName, environment)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusOK, check)
	}
}

func ingestMetrics(metricsService *services.MetricsService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var metric struct {
			ServiceID  uint    `json:"service_id" binding:"required"`
			SLOID      uint    `json:"slo_id" binding:"required"`
			Timestamp  string  `json:"timestamp" binding:"required"`
			Value      float64 `json:"value" binding:"required"`
			MetricType string  `json:"metric_type" binding:"required"`
		}
		
		if err := c.ShouldBindJSON(&metric); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		
		// Parse timestamp
		timestamp, err := time.Parse(time.RFC3339, metric.Timestamp)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid timestamp format"})
			return
		}
		
		if err := metricsService.IngestMetric(metric.ServiceID, metric.SLOID, timestamp, metric.Value, metric.MetricType); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		c.JSON(http.StatusAccepted, gin.H{"status": "accepted"})
	}
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
		"service": "slo-platform",
	})
}
