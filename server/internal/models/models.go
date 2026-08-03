package models

import "time"

type Project struct {
	ID   int
	Name string
	// Pinned is derived from the pinned_project table on read. It is never
	// written through UpdateProject — pin changes go through the pinned bulk
	// endpoint so membership and pin order stay in one place.
	Pinned       bool
	Archived     bool
	Folder       int
	Workflow     int
	WorkflowName string
	TimeCreated  *time.Time
	TimeModified *time.Time
}

type ProjectFolder struct {
	ID        int    `json:"ID"`
	Name      string `json:"Name"`
	IsDefault bool   `json:"IsDefault"`
	SortOrder int    `json:"SortOrder"`
}

type Checklist struct {
	ID           int
	Name         string
	Description  string
	Project      int
	TimeCreated  *time.Time
	TimeModified *time.Time
	IsDefault    bool
}

type StageCount struct {
	StageID int
	Count   int
}

type ChecklistDetails struct {
	Checklist
	DoneCount   int
	TotalCount  int
	Status      string
	StageCounts []StageCount
}

type TaskTypeCategory struct {
	ID        int    `json:"ID"`
	Name      string `json:"Name"`
	IsDefault bool   `json:"IsDefault"`
	SortOrder int    `json:"SortOrder"`
}

type TaskType struct {
	ID          int    `json:"ID"`
	Name        string `json:"Name"`
	Description string `json:"Description"`
	Icon        string `json:"Icon"`
	Color       string `json:"Color"`
	IsDefault   bool   `json:"IsDefault"`
	Category    int    `json:"Category"`
}

type TaskTypeGlobal struct {
	TaskType
	ProjectCount int `json:"ProjectCount"`
	TaskCount    int `json:"TaskCount"`
}

type TaskTypeWithCount struct {
	TaskType
	TaskCount int `json:"TaskCount"`
}

type ProjectTaskTypeSettings struct {
	AllTypes       []TaskTypeWithCount `json:"AllTypes"`
	EnabledTypeIDs []int               `json:"EnabledTypeIDs"`
	Categories     []TaskTypeCategory  `json:"Categories"`
}

type Task struct {
	ID                  int
	Checklist           int
	Stage               int
	Name                string
	Body                string
	TimeCreated         *time.Time
	TimeModified        *time.Time
	TimePlannedStart    *time.Time
	TimePlannedEnd      *time.Time
	HasTimePlannedStart bool
	HasTimePlannedEnd   bool
	TimeCompleted       *time.Time
	Assignee            string
	Priority            string
	Type                TaskType
}

type ChecklistTask struct {
	Task
	ChecklistName string
}

type TaskWithProject struct {
	ChecklistTask
	ProjectID int
}

type Workflow struct {
	ID           int
	Name         string
	Description  string
	TimeCreated  *time.Time
	TimeModified *time.Time
}

type Stage struct {
	ID           int
	Workflow     int
	Name         string
	Description  string
	Color        string
	Icon         string
	Position     int
	Type         string
	TaskCount    int
	TimeCreated  *time.Time
	TimeModified *time.Time
}

type TaskRelationshipType struct {
	ID         int    `json:"ID"`
	FromName   string `json:"FromName"`
	ToName     string `json:"ToName"`
	Behavior   string `json:"Behavior"`
	Icon       string `json:"Icon"`
	Color      string `json:"Color"`
	IsSystem   bool   `json:"IsSystem"`
	UsageCount int    `json:"UsageCount"`
}

// RelatedTask is the "other" task in a relationship, summarized from the
// queried task's perspective. It carries enough to render a task row (priority,
// stage, type) without a second fetch, since the task may live in any project.
type RelatedTask struct {
	ID            int      `json:"ID"`
	Name          string   `json:"Name"`
	ProjectID     int      `json:"ProjectID"`
	ProjectName   string   `json:"ProjectName"`
	ChecklistName string   `json:"ChecklistName"`
	Priority      string   `json:"Priority"`
	IsDone        bool     `json:"IsDone"`
	Stage         Stage    `json:"Stage"`
	Type          TaskType `json:"Type"`
}

type TaskRelationship struct {
	ID        int                  `json:"ID"`
	Type      TaskRelationshipType `json:"Type"`
	Direction string               `json:"Direction"` // "from" if the queried task is fromTask, else "to"
	Other     RelatedTask          `json:"Other"`
}

type TaskRelationshipsResult struct {
	Relationships []TaskRelationship `json:"Relationships"`
}

type BulkResult struct {
	Success int `json:"success"`
	Failed  int `json:"failed"`
	Skipped int `json:"skipped"`
}

type TaskFacets struct {
	Assignees  []string         `json:"assignees"`
	Checklists []ChecklistFacet `json:"checklists"`
}

type ChecklistFacet struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	ProjectID int    `json:"projectId"`
}
