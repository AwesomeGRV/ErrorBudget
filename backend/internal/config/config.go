package config

import (
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	DatabaseURL   string
	PrometheusURL string
	JWTSecret     string
	ServerPort    string
	Environment   string
}

func Load() *Config {
	viper.SetDefault("database_url", "postgres://slo_user:slo_pass@localhost:5432/slo_platform?sslmode=disable")
	viper.SetDefault("prometheus_url", "http://localhost:9090")
	viper.SetDefault("jwt_secret", "your-secret-key")
	viper.SetDefault("server_port", "8080")
	viper.SetDefault("environment", "development")

	viper.SetEnvPrefix("SLO")
	viper.AutomaticEnv()

	return &Config{
		DatabaseURL:   viper.GetString("database_url"),
		PrometheusURL: viper.GetString("prometheus_url"),
		JWTSecret:     viper.GetString("jwt_secret"),
		ServerPort:    viper.GetString("server_port"),
		Environment:   viper.GetString("environment"),
	}
}
