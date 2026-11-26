package repos

import (
	"database/sql"
	"time"

	models "github.com/waseem-polus/aycorn/server/internal/models"
)

// UsageRepo answers the aggregate questions behind the /usage page. Every
// query is scoped to tasks in non-archived projects, so archiving a project
// removes its work from the stats — usage reflects the work you still track.
type UsageRepo struct {
	DB *sql.DB
}

// activeTasks joins a task to its project and keeps only non-archived ones.
const activeTasks = `
	FROM task t
	JOIN checklist c ON c.id = t.checklist
	JOIN project p ON p.id = c.project
	JOIN stage s ON s.id = t.stage
	WHERE p.archived = 0`

// taskDeadline is a task's due moment. A date-only planned end (no time set)
// is stored as local midnight, so the task is due at the end of that day.
const taskDeadline = `
	CASE WHEN t.hasTimePlannedEnd THEN julianday(t.timePlannedEnd)
	     ELSE julianday(t.timePlannedEnd, '+1 day') END`

// sqlTime formats t the way the schema stores timestamps.
func sqlTime(t time.Time) string {
	return t.UTC().Format("2006-01-02T15:04:05Z")
}

func (repo *UsageRepo) CountActiveProjects() (int, error) {
	var n int
	err := repo.DB.QueryRow("SELECT COUNT(*) FROM project WHERE archived = 0;").Scan(&n)
	return n, err
}

func (repo *UsageRepo) CountProjectsCreatedSince(since time.Time) (int, error) {
	var n int
	err := repo.DB.QueryRow(
		"SELECT COUNT(*) FROM project WHERE archived = 0 AND julianday(timeCreated) >= julianday(?);",
		sqlTime(since),
	).Scan(&n)
	return n, err
}

// CountCompleted counts tasks completed in [from, to).
func (repo *UsageRepo) CountCompleted(from, to time.Time) (int, error) {
	var n int
	err := repo.DB.QueryRow(
		"SELECT COUNT(*)"+activeTasks+`
		  AND t.timeCompleted IS NOT NULL
		  AND julianday(t.timeCompleted) >= julianday(?)
		  AND julianday(t.timeCompleted) <  julianday(?);`,
		sqlTime(from), sqlTime(to),
	).Scan(&n)
	return n, err
}

// CountDeadlines counts tasks whose deadline fell in [from, to), and how many
// of those were completed on or before it. Open tasks past their deadline count
// as late, so the rate can't be gamed by never finishing late work.
func (repo *UsageRepo) CountDeadlines(from, to time.Time) (due int, onTime int, err error) {
	err = repo.DB.QueryRow(
		`SELECT COUNT(*),
		        COALESCE(SUM(t.timeCompleted IS NOT NULL
		                     AND julianday(t.timeCompleted) <= `+taskDeadline+`), 0)`+
			activeTasks+`
		  AND t.timePlannedEnd IS NOT NULL
		  AND `+taskDeadline+` >= julianday(?)
		  AND `+taskDeadline+` <  julianday(?);`,
		sqlTime(from), sqlTime(to),
	).Scan(&due, &onTime)
	return due, onTime, err
}

// OpenPriorityCounts counts not-done Urgent and High tasks, and how many of
// those are past their deadline at now.
func (repo *UsageRepo) OpenPriorityCounts(now time.Time) (models.UsagePriority, error) {
	out := models.UsagePriority{}
	err := repo.DB.QueryRow(
		`SELECT COALESCE(SUM(t.priority = 'Urgent'), 0),
		        COALESCE(SUM(t.priority = 'High'), 0),
		        COALESCE(SUM(t.timePlannedEnd IS NOT NULL AND `+taskDeadline+` < julianday(?)), 0)`+
			activeTasks+`
		  AND s.type <> 'done'
		  AND t.priority IN ('Urgent', 'High');`,
		sqlTime(now),
	).Scan(&out.Urgent, &out.High, &out.Overdue)
	return out, err
}

// DailyActivity returns created/completed counts per local calendar day for
// days on or after since. Days with no activity are omitted; the service
// zero-fills them.
func (repo *UsageRepo) DailyActivity(since time.Time) ([]models.UsageDay, error) {
	rows, err := repo.DB.Query(
		`SELECT day, SUM(created), SUM(completed) FROM (
		   SELECT date(t.timeCreated, 'localtime') AS day, 1 AS created, 0 AS completed`+activeTasks+`
		     AND julianday(t.timeCreated) >= julianday(?1)
		   UNION ALL
		   SELECT date(t.timeCompleted, 'localtime'), 0, 1`+activeTasks+`
		     AND t.timeCompleted IS NOT NULL
		     AND julianday(t.timeCompleted) >= julianday(?1)
		 )
		 GROUP BY day
		 ORDER BY day;`,
		sqlTime(since),
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	days := []models.UsageDay{}
	for rows.Next() {
		d := models.UsageDay{}
		if err := rows.Scan(&d.Date, &d.Created, &d.Completed); err != nil {
			return nil, err
		}
		days = append(days, d)
	}
	return days, rows.Err()
}
