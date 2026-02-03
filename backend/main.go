package main

import (
	"log"
	"os"

	"slo-platform/internal/api"
	"slo-platform/internal/config"
	"slo-platform/internal/database"
	"slo-platform/internal/services"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	cfg := config.Load()
	
	logger, _ := zap.NewProduction()
	defer logger.Sync()
	zap.ReplaceGlobals(logger)

	db, err := database.NewConnection(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err := database.Migrate(db); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	serviceRegistry := services.NewServiceRegistry(db)
	sloService := services.NewSLOService(db)
	metricsService := services.NewMetricsService(db, cfg.PrometheusURL)

	router := gin.Default()
	api.SetupRoutes(router, serviceRegistry, sloService, metricsService)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	logger.Info("Starting SLO Platform", zap.String("port", port))
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
