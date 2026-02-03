package services

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"slo-platform/internal/models"

	"github.com/prometheus/client_golang/api"
	v1 "github.com/prometheus/client_golang/api/prometheus/v1"
	"github.com/prometheus/common/model"
	"gorm.io/gorm"
)

type MetricsService struct {
	db             *gorm.DB
	prometheusURL  string
	prometheusAPI  v1.API
}

func NewMetricsService(db *gorm.DB, prometheusURL string) *MetricsService {
	client, err := api.NewClient(api.Config{
		Address: prometheusURL,
	})
	if err != nil {
		// Log error but don't fail - service can work with mock data
		fmt.Printf("Failed to create Prometheus client: %v\n", err)
	}

	var promAPI v1.API
	if client != nil {
		promAPI = v1.NewAPI(client)
	}

	return &MetricsService{
		db:            db,
		prometheusURL: prometheusURL,
		prometheusAPI: promAPI,
	}
}

func (ms *MetricsService) IngestMetric(serviceID, sloID uint, timestamp time.Time, value float64, metricType string) error {
	metric := models.MetricIngest{
		ServiceID:  serviceID,
		SLOID:      sloID,
		Timestamp:  timestamp,
		Value:      value,
		MetricType: metricType,
	}
	return ms.db.Create(&metric).Error
}

func (ms *MetricsService) GetCurrentSLI(slo *models.SLO) (float64, error) {
	if ms.prometheusAPI == nil {
		return ms.getMockSLI(slo), nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	switch slo.SLIType {
	case models.SLITypeAvailability:
		return ms.calculateAvailability(ctx, slo)
	case models.SLITypeLatency:
		return ms.calculateLatency(ctx, slo)
	case models.SLITypeErrorRate:
		return ms.calculateErrorRate(ctx, slo)
	case models.SLITypeCustom:
		return ms.queryCustomMetric(ctx, slo)
	default:
		return 0.0, fmt.Errorf("unsupported SLI type: %s", slo.SLIType)
	}
}

func (ms *MetricsService) calculateAvailability(ctx context.Context, slo *models.SLO) (float64, error) {
	if slo.PrometheusQuery != "" {
		return ms.queryCustomMetric(ctx, slo)
	}

	// Default availability calculation
	successQuery := fmt.Sprintf(`sum(rate(http_requests_total{service="%s",status!~"5.."}[5m]))`, slo.Service.Name)
	totalQuery := fmt.Sprintf(`sum(rate(http_requests_total{service="%s"}[5m]))`, slo.Service.Name)

	successValue, err := ms.queryPrometheus(ctx, successQuery)
	if err != nil {
		return 0, err
	}

	totalValue, err := ms.queryPrometheus(ctx, totalQuery)
	if err != nil {
		return 0, err
	}

	if totalValue == 0 {
		return 1.0, nil // 100% availability if no traffic
	}

	return successValue / totalValue, nil
}

func (ms *MetricsService) calculateLatency(ctx context.Context, slo *models.SLO) (float64, error) {
	if slo.PrometheusQuery != "" {
		return ms.queryCustomMetric(ctx, slo)
	}

	// Default latency calculation (p95)
	query := fmt.Sprintf(
		`histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service="%s"}[5m])) by (le))`,
		slo.Service.Name,
	)

	latencyValue, err := ms.queryPrometheus(ctx, query)
	if err != nil {
		return 0, err
	}

	// Convert to compliance ratio (1.0 = perfect, lower is worse)
	if slo.LatencyThreshold > 0 {
		if latencyValue <= slo.LatencyThreshold {
			return 1.0, nil
		}
		return slo.LatencyThreshold / latencyValue, nil
	}

	return 0.95, nil // Mock value
}

func (ms *MetricsService) calculateErrorRate(ctx context.Context, slo *models.SLO) (float64, error) {
	if slo.PrometheusQuery != "" {
		return ms.queryCustomMetric(ctx, slo)
	}

	// Default error rate calculation
	errorQuery := fmt.Sprintf(`sum(rate(http_requests_total{service="%s",status=~"5.."}[5m]))`, slo.Service.Name)
	totalQuery := fmt.Sprintf(`sum(rate(http_requests_total{service="%s"}[5m]))`, slo.Service.Name)

	errorValue, err := ms.queryPrometheus(ctx, errorQuery)
	if err != nil {
		return 0, err
	}

	totalValue, err := ms.queryPrometheus(ctx, totalQuery)
	if err != nil {
		return 0, err
	}

	if totalValue == 0 {
		return 1.0, nil // 100% success rate if no traffic
	}

	successRate := 1.0 - (errorValue / totalValue)
	return successRate, nil
}

func (ms *MetricsService) queryCustomMetric(ctx context.Context, slo *models.SLO) (float64, error) {
	if slo.PrometheusQuery == "" {
		return 0.0, fmt.Errorf("no Prometheus query defined for custom SLO")
	}

	return ms.queryPrometheus(ctx, slo.PrometheusQuery)
}

func (ms *MetricsService) queryPrometheus(ctx context.Context, query string) (float64, error) {
	result, warnings, err := ms.prometheusAPI.Query(ctx, query, time.Now())
	if err != nil {
		return 0, fmt.Errorf("prometheus query failed: %w", err)
	}

	if len(warnings) > 0 {
		fmt.Printf("Prometheus query warnings: %v\n", warnings)
	}

	switch result.Type() {
	case model.ValVector:
		vector := result.(model.Vector)
		if len(vector) == 0 {
			return 0.0, fmt.Errorf("no data returned from query")
		}
		return float64(vector[0].Value), nil
	case model.ValScalar:
		scalar := result.(*model.Scalar)
		return float64(scalar.Value), nil
	default:
		return 0.0, fmt.Errorf("unsupported result type: %s", result.Type())
	}
}

func (ms *MetricsService) getMockSLI(slo *models.SLO) float64 {
	// Mock data for development/testing
	switch slo.SLIType {
	case models.SLITypeAvailability:
		return 0.9987 // 99.87% availability
	case models.SLITypeLatency:
		return 0.995  // 99.5% latency compliance
	case models.SLITypeErrorRate:
		return 0.992  // 99.2% success rate
	case models.SLITypeCustom:
		return 0.99   // 99% for custom
	default:
		return 0.99
	}
}

func (ms *MetricsService) GetBurnRates(slo *models.SLO) (*BurnRates, error) {
	if ms.prometheusAPI == nil {
		return ms.getMockBurnRates(), nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Calculate burn rates over different time windows
	fiveMinBurn, _ := ms.calculateBurnRate(ctx, slo, "5m")
	oneHourBurn, _ := ms.calculateBurnRate(ctx, slo, "1h")
	sixHourBurn, _ := ms.calculateBurnRate(ctx, slo, "6h")
	twentyFourHourBurn, _ := ms.calculateBurnRate(ctx, slo, "24h")

	return &BurnRates{
		CurrentBurnRate:    oneHourBurn, // Use 1h as current
		FiveMinuteBurn:     fiveMinBurn,
		OneHourBurn:        oneHourBurn,
		SixHourBurn:        sixHourBurn,
		TwentyFourHourBurn: twentyFourHourBurn,
	}, nil
}

func (ms *MetricsService) calculateBurnRate(ctx context.Context, slo *models.SLO, timeWindow string) (float64, error) {
	// This is a simplified burn rate calculation
	// In production, you'd want more sophisticated logic
	
	query := fmt.Sprintf(
		`(sum(rate(%s[%s])) / sum(rate(%s[%s])))`,
		slo.SuccessMetric, timeWindow,
		slo.TotalMetric, timeWindow,
	)

	rate, err := ms.queryPrometheus(ctx, query)
	if err != nil {
		return 1.0, err // Default to normal burn rate
	}

	// Convert to burn rate multiplier (1.0 = normal consumption)
	normalConsumption := slo.Target
	if rate <= 0 {
		return 1.0, nil
	}

	return (1.0 - rate) / (1.0 - normalConsumption), nil
}

func (ms *MetricsService) getMockBurnRates() *BurnRates {
	return &BurnRates{
		CurrentBurnRate:    1.2,
		FiveMinuteBurn:     0.8,
		OneHourBurn:        1.1,
		SixHourBurn:        1.3,
		TwentyFourHourBurn: 1.0,
	}
}
