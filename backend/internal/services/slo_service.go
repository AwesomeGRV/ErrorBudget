package services

import (
	"fmt"
	"math"
	"time"

	"slo-platform/internal/models"

	"gorm.io/gorm"
)

type SLOService struct {
	db *gorm.DB
}

func NewSLOService(db *gorm.DB) *SLOService {
	return &SLOService{db: db}
}

func (s *SLOService) CreateSLO(slo *models.SLO) error {
	return s.db.Create(slo).Error
}

func (s *SLOService) GetSLO(id uint) (*models.SLO, error) {
	var slo models.SLO
	err := s.db.Preload("Service").First(&slo, id).Error
	return &slo, err
}

func (s *SLOService) ListSLOs(serviceID uint) ([]models.SLO, error) {
	var slos []models.SLO
	err := s.db.Where("service_id = ?", serviceID).Find(&slos).Error
	return slos, err
}

func (s *SLOService) CalculateSLOStatus(sloID uint) (*models.SLOStatus, error) {
	slo, err := s.GetSLO(sloID)
	if err != nil {
		return nil, err
	}

	// Get current SLI value (this would normally query Prometheus)
	currentSLI, err := s.getCurrentSLI(slo)
	if err != nil {
		return nil, err
	}

	// Calculate error budget
	errorBudget := s.calculateErrorBudget(slo, currentSLI)

	// Calculate burn rates
	burnRates := s.calculateBurnRates(slo)

	// Determine status
	status := s.determineSLOStatus(currentSLI, slo.Target, errorBudget.RemainingPercent)

	// Calculate time to exhaustion
	timeToExhaustion := s.calculateTimeToExhaustion(errorBudget.RemainingBudget, burnRates.CurrentBurnRate)

	return &models.SLOStatus{
		SLOID:            slo.ID,
		ServiceName:      slo.Service.Name,
		SLOName:          slo.Name,
		CurrentSLI:       currentSLI,
		Target:           slo.Target,
		Status:           status,
		RemainingBudget:  errorBudget.RemainingPercent,
		ConsumedBudget:   100 - errorBudget.RemainingPercent,
		CurrentBurnRate:  burnRates.CurrentBurnRate,
		FastBurnRate:     burnRates.FiveMinuteBurn,
		SlowBurnRate:     burnRates.SixHourBurn,
		TimeToExhaustion: timeToExhaustion,
		LastUpdated:      time.Now(),
	}, nil
}

func (s *SLOService) GetErrorBudget(sloID uint) (*models.ErrorBudget, error) {
	slo, err := s.GetSLO(sloID)
	if err != nil {
		return nil, err
	}

	currentSLI, err := s.getCurrentSLI(slo)
	if err != nil {
		return nil, err
	}

	errorBudget := s.calculateErrorBudget(slo, currentSLI)
	burnRates := s.calculateBurnRates(slo)

	return &models.ErrorBudget{
		SLOID:             slo.ID,
		TotalBudget:       errorBudget.TotalBudget,
		ConsumedBudget:    errorBudget.ConsumedBudget,
		RemainingBudget:   errorBudget.RemainingBudget,
		RemainingPercent:  errorBudget.RemainingPercent,
		CurrentBurnRate:   burnRates.CurrentBurnRate,
		FiveMinuteBurn:    burnRates.FiveMinuteBurn,
		OneHourBurn:       burnRates.OneHourBurn,
		SixHourBurn:       burnRates.SixHourBurn,
		TwentyFourHourBurn: burnRates.TwentyFourHourBurn,
		LastUpdated:       time.Now(),
	}, nil
}

func (s *SLOService) CheckDeploySafety(serviceName, environment string) (*models.DeployCheck, error) {
	var service models.Service
	err := s.db.Where("name = ? AND environment = ?", serviceName, environment).First(&service).Error
	if err != nil {
		return nil, fmt.Errorf("service not found: %w", err)
	}

	var slos []models.SLO
	err = s.db.Where("service_id = ?", service.ID).Find(&slos).Error
	if err != nil {
		return nil, err
	}

	if len(slos) == 0 {
		return &models.DeployCheck{
			ServiceName: serviceName,
			Environment: environment,
			Decision:    models.DeployDecisionSafe,
			Reason:      "No SLOs defined for this service",
			CheckedAt:   time.Now(),
		}, nil
	}

	// Get the most critical SLO status
	var worstSLO *models.SLOStatus
	var worstBudget float64 = 100

	for _, slo := range slos {
		status, err := s.CalculateSLOStatus(slo.ID)
		if err != nil {
			continue
		}

		if status.RemainingBudget < worstBudget {
			worstBudget = status.RemainingBudget
			worstSLO = status
		}
	}

	if worstSLO == nil {
		return &models.DeployCheck{
			ServiceName: serviceName,
			Environment: environment,
			Decision:    models.DeployDecisionSafe,
			Reason:      "Unable to calculate SLO status",
			CheckedAt:   time.Now(),
		}, nil
	}

	decision, reason := s.evaluateDeployDecision(worstSLO)

	return &models.DeployCheck{
		ServiceName:     serviceName,
		Environment:     environment,
		Decision:        decision,
		Reason:          reason,
		RemainingBudget: worstSLO.RemainingBudget,
		BurnRate:        worstSLO.CurrentBurnRate,
		RecentIncidents: s.hasRecentIncidents(service.ID),
		CheckedAt:       time.Now(),
	}, nil
}

type ErrorBudgetCalc struct {
	TotalBudget     float64
	ConsumedBudget  float64
	RemainingBudget float64
	RemainingPercent float64
}

type BurnRates struct {
	CurrentBurnRate   float64
	FiveMinuteBurn    float64
	OneHourBurn       float64
	SixHourBurn       float64
	TwentyFourHourBurn float64
}

func (s *SLOService) getCurrentSLI(slo *models.SLO) (float64, error) {
	// This would normally query Prometheus
	// For now, return a mock value based on SLO type
	switch slo.SLIType {
	case models.SLITypeAvailability:
		return 0.9987, nil // 99.87% availability
	case models.SLITypeLatency:
		return 0.995, nil // 99.5% latency compliance
	case models.SLITypeErrorRate:
		return 0.992, nil // 99.2% success rate
	default:
		return 0.99, nil
	}
}

func (s *SLOService) calculateErrorBudget(slo *models.SLO, currentSLI float64) *ErrorBudgetCalc {
	totalBudget := 1.0 - slo.Target
	consumedBudget := totalBudget * (1.0 - currentSLI/slo.Target)
	remainingBudget := totalBudget - consumedBudget
	remainingPercent := (remainingBudget / totalBudget) * 100

	return &ErrorBudgetCalc{
		TotalBudget:      totalBudget,
		ConsumedBudget:   consumedBudget,
		RemainingBudget:  remainingBudget,
		RemainingPercent: remainingPercent,
	}
}

func (s *SLOService) calculateBurnRates(slo *models.SLO) *BurnRates {
	// Mock burn rates - in production, these would be calculated from historical data
	return &BurnRates{
		CurrentBurnRate:   1.2,
		FiveMinuteBurn:    0.8,
		OneHourBurn:       1.1,
		SixHourBurn:       1.3,
		TwentyFourHourBurn: 1.0,
	}
}

func (s *SLOService) determineSLOStatus(currentSLI, target, remainingBudget float64) string {
	if currentSLI < target {
		return "breached"
	}
	if remainingBudget < 20 {
		return "degraded"
	}
	return "healthy"
}

func (s *SLOService) calculateTimeToExhaustion(remainingBudget, burnRate float64) int {
	if burnRate <= 0 {
		return -1 // Infinite
	}
	hoursToExhaust := (remainingBudget / burnRate) * 24
	return int(math.Ceil(hoursToExhaust))
}

func (s *SLOService) evaluateDeployDecision(status *models.SLOStatus) (models.DeployDecision, string) {
	// Core deploy gate logic
	if status.RemainingBudget < 10 && status.CurrentBurnRate > 1 {
		return models.DeployDecisionBlocked, "Error budget critically low with active burn"
	}
	
	if status.CurrentBurnRate > 2 {
		return models.DeployDecisionRisky, "High burn rate detected"
	}
	
	if status.RemainingBudget < 20 {
		return models.DeployDecisionRisky, "Low error budget remaining"
	}
	
	return models.DeployDecisionSafe, "SLO status healthy"
}

func (s *SLOService) hasRecentIncidents(serviceID uint) bool {
	// Mock implementation - would check incident management system
	return false
}
