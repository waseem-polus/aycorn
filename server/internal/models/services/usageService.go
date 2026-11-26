package services

import (
	"errors"
	"time"

	"github.com/waseem-polus/aycorn/server/internal/models"
	"github.com/waseem-polus/aycorn/server/internal/models/repos"
)

const (
	usageWindowDays      = 30
	usageMaxActivityDays = 365
)

var ErrInvalidUsageRange = errors.New("days must be between 1 and 365")

type UsageService struct {
	UsageRepo *repos.UsageRepo
}

// Get builds the usage summary as of now, with activityDays days of daily
// created/completed counts (today included), zero-filled.
func (s *UsageService) Get(now time.Time, activityDays int) (*models.Usage, error) {
	if activityDays < 1 || activityDays > usageMaxActivityDays {
		return nil, ErrInvalidUsageRange
	}

	window := usageWindowDays * 24 * time.Hour
	currentStart := now.Add(-window)
	previousStart := currentStart.Add(-window)

	usage := &models.Usage{WindowDays: usageWindowDays}
	var err error

	if usage.ActiveProjects, err = s.UsageRepo.CountActiveProjects(); err != nil {
		return nil, err
	}
	if usage.NewProjects, err = s.UsageRepo.CountProjectsCreatedSince(currentStart); err != nil {
		return nil, err
	}
	if usage.CompletedTasks.Current, err = s.UsageRepo.CountCompleted(currentStart, now); err != nil {
		return nil, err
	}
	if usage.CompletedTasks.Previous, err = s.UsageRepo.CountCompleted(previousStart, currentStart); err != nil {
		return nil, err
	}
	if usage.OpenPriority, err = s.UsageRepo.OpenPriorityCounts(now); err != nil {
		return nil, err
	}

	due, onTime, err := s.UsageRepo.CountDeadlines(currentStart, now)
	if err != nil {
		return nil, err
	}
	usage.OnTimeRate.CurrentDue, usage.OnTimeRate.CurrentOnTime = due, onTime
	usage.OnTimeRate.Current = percent(onTime, due)

	due, onTime, err = s.UsageRepo.CountDeadlines(previousStart, currentStart)
	if err != nil {
		return nil, err
	}
	usage.OnTimeRate.PreviousDue, usage.OnTimeRate.PreviousOnTime = due, onTime
	usage.OnTimeRate.Previous = percent(onTime, due)

	if usage.Activity, err = s.dailyActivity(now, activityDays); err != nil {
		return nil, err
	}
	return usage, nil
}

// dailyActivity returns one entry per local day from days-1 days ago through
// today, filling days the repo has no rows for with zeros.
func (s *UsageService) dailyActivity(now time.Time, days int) ([]models.UsageDay, error) {
	local := now.Local()
	today := time.Date(local.Year(), local.Month(), local.Day(), 0, 0, 0, 0, time.Local)
	first := today.AddDate(0, 0, -(days - 1))

	rows, err := s.UsageRepo.DailyActivity(first)
	if err != nil {
		return nil, err
	}
	byDate := make(map[string]models.UsageDay, len(rows))
	for _, r := range rows {
		byDate[r.Date] = r
	}

	out := make([]models.UsageDay, 0, days)
	for d := first; !d.After(today); d = d.AddDate(0, 0, 1) {
		key := d.Format("2006-01-02")
		day, ok := byDate[key]
		if !ok {
			day = models.UsageDay{Date: key}
		}
		out = append(out, day)
	}
	return out, nil
}

// percent returns part/total as a rounded 0–100 integer, or nil when total is 0.
func percent(part, total int) *int {
	if total == 0 {
		return nil
	}
	p := (part*100 + total/2) / total
	return &p
}
