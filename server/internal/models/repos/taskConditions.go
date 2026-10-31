package repos

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strings"

	"github.com/waseem-polus/aycorn/server/internal/timefmt"
)

// A task condition tree is the advanced half of task filtering: nested
// AND/OR groups of property/operator/value conditions. It arrives as JSON in
// the `conditions` query param, is validated once by ParseTaskConditions, and
// is compiled into a single parenthesised WHERE fragment that
// appendTaskFilterClauses ANDs onto the basic filters.
//
// The JSON shape is the client's wire format (and the payload a future saved
// filter will store):
//
//	{"match":"all","children":[
//	  {"property":"priority","operator":"is_not","values":["Low"]},
//	  {"match":"any","children":[...]}]}

// MaxTaskConditionDepth caps group nesting: the root group plus two nested
// levels. The UI hides nesting actions at this depth; the server enforces it.
const MaxTaskConditionDepth = 3

// maxTaskConditionNodes bounds the tree size so a malformed or hostile request
// can't produce an arbitrarily large SQL statement.
const maxTaskConditionNodes = 200

type TaskConditionGroup struct {
	// Match is "all" (AND) or "any" (OR).
	Match    string
	Children []TaskConditionNode
}

// TaskConditionNode is exactly one of Group or Condition.
type TaskConditionNode struct {
	Group     *TaskConditionGroup
	Condition *TaskCondition
}

type TaskCondition struct {
	Property string
	Operator string
	// Values holds the bind values for is / is_not, already typed for the
	// column (int for ID properties, string otherwise).
	Values []any
	// At is the bound for before / after; From and To bound on / between.
	// All are canonical timefmt.Layout strings.
	At   string
	From string
	To   string
	// Text is the operand for the text operators (contains, equals, …).
	Text string
	// LinkType and Direction pick one direction of one relationship type for
	// the taskLink property: "from" means this task is the relationship's
	// fromTask (e.g. it Blocks), "to" that it is the toTask (Blocked By).
	LinkType  int
	Direction string
	// LinkMatch is "any" or "none" when a taskLink condition tests for any
	// linked task at all rather than specific ones in Values.
	LinkMatch string
}

type conditionValueKind int

const (
	conditionValueInt conditionValueKind = iota
	conditionValueString
	conditionValueDate
	conditionValueText
	// conditionValuePresence properties take no value at all: only the
	// is_empty / is_not_empty checks against emptyExpr.
	conditionValuePresence
	// conditionValueLink is the per-direction task link: task ids, or the
	// "any" / "none" sentinels.
	conditionValueLink
)

// taskConditionProperty describes how one filterable property maps to SQL.
// Adding a property is a new entry here plus one on the client registry.
type taskConditionProperty struct {
	kind conditionValueKind
	// column is the value expression for enum and text properties.
	column string
	// emptyExpr is the "has no value" predicate for nullable properties. An
	// empty string means the property can't be empty, so is_empty and
	// is_not_empty aren't allowed.
	emptyExpr string
	// start and end are the effective window bounds of a date property. A
	// point-in-time date uses the same column for both.
	start string
	end   string
	// allowed restricts string values to a fixed set (e.g. the priority
	// CHECK constraint).
	allowed []string
	// flagOps are extra value-less operators specific to this property,
	// mapped straight to their predicate (e.g. project is_archived).
	flagOps map[string]string
}

// textOperators are shared by every text property. Comparisons are
// case-insensitive: LIKE is for ASCII in SQLite, and equals uses NOCASE.
var textOperators = []string{"contains", "does_not_contain", "equals", "not_equals"}

// taskLinkExists is the subquery behind every taskLink condition; the two
// %s are this task's side and the linked task's side of the relationship.
const taskLinkExists = "EXISTS (SELECT 1 FROM task_relationship r WHERE r.%s = t.id AND r.relationshipType = ?%s)"

var taskConditionProperties = map[string]taskConditionProperty{
	"project": {
		kind:   conditionValueInt,
		column: "c.project",
		flagOps: map[string]string{
			"is_archived":     "EXISTS (SELECT 1 FROM project p WHERE p.id = c.project AND p.archived = 1)",
			"is_not_archived": "EXISTS (SELECT 1 FROM project p WHERE p.id = c.project AND p.archived = 0)",
		},
	},
	"projectName": {
		kind:   conditionValueText,
		column: "COALESCE((SELECT p.name FROM project p WHERE p.id = c.project), '')",
	},
	"checklistName": {kind: conditionValueText, column: "COALESCE(c.name, '')"},
	// Task listings INNER JOIN checklist, so a task without a checklist is
	// never listed and "checklist is empty" could never match.
	"checklist": {kind: conditionValueInt, column: "t.checklist"},
	"stage":     {kind: conditionValueInt, column: "t.stage"},
	"type":      {kind: conditionValueInt, column: "t.type"},
	// A stage's category. Mirrors the stage.type CHECK constraint — a new
	// category needs a migration there and an entry here.
	"stageType": {
		kind:    conditionValueString,
		column:  "(SELECT s.type FROM stage s WHERE s.id = t.stage)",
		allowed: []string{"open", "todo", "doing", "done"},
	},
	"assignee": {
		kind:      conditionValueString,
		column:    "t.assignee",
		emptyExpr: "(t.assignee IS NULL OR t.assignee = '')",
	},
	"priority": {
		kind:      conditionValueString,
		column:    "t.priority",
		emptyExpr: "t.priority IS NULL",
		allowed:   []string{"Urgent", "High", "Medium", "Low"},
	},
	"title": {kind: conditionValueText, column: "COALESCE(t.name, '')"},
	// A planned window may be open-ended on either side; treat a missing bound
	// as the other one so a single-date task behaves like a point.
	"timePlanned": {
		kind:      conditionValueDate,
		start:     "COALESCE(t.timePlannedStart, t.timePlannedEnd)",
		end:       "COALESCE(t.timePlannedEnd, t.timePlannedStart)",
		emptyExpr: "(t.timePlannedStart IS NULL AND t.timePlannedEnd IS NULL)",
	},
	"timeCompleted": {
		kind:      conditionValueDate,
		start:     "t.timeCompleted",
		end:       "t.timeCompleted",
		emptyExpr: "t.timeCompleted IS NULL",
	},
	// Whether the task has any link at all, in either direction, of any type.
	"taskLinks": {
		kind:      conditionValuePresence,
		emptyExpr: "NOT EXISTS (SELECT 1 FROM task_relationship r WHERE r.fromTask = t.id OR r.toTask = t.id)",
	},
	"taskLink": {kind: conditionValueLink},
}

// wireConditionNode is the raw JSON shape; a node is a group when it has a
// "match" key.
type wireConditionNode struct {
	Match    *string             `json:"match"`
	Children []wireConditionNode `json:"children"`
	Property string              `json:"property"`
	Operator string              `json:"operator"`
	Values   []any               `json:"values"`
	At       string              `json:"at"`
	From     string              `json:"from"`
	To       string              `json:"to"`
	Text     string              `json:"text"`
	// taskLink only.
	LinkType  *int   `json:"linkType"`
	Direction string `json:"direction"`
}

// ParseTaskConditions decodes and validates a condition tree. An empty string
// means "no conditions" and returns nil. Any structural or value problem is
// returned as an error — the handler maps it to 400 rather than silently
// dropping part of the user's logic.
func ParseTaskConditions(raw string) (*TaskConditionGroup, error) {
	if strings.TrimSpace(raw) == "" {
		return nil, nil
	}

	var root wireConditionNode
	dec := json.NewDecoder(strings.NewReader(raw))
	dec.UseNumber()
	if err := dec.Decode(&root); err != nil {
		return nil, fmt.Errorf("invalid conditions: %w", err)
	}
	if root.Match == nil {
		return nil, errors.New("invalid conditions: root must be a group")
	}

	nodes := 0
	group, err := parseConditionGroup(root, 1, &nodes)
	if err != nil {
		return nil, fmt.Errorf("invalid conditions: %w", err)
	}
	return group, nil
}

func parseConditionGroup(w wireConditionNode, depth int, nodes *int) (*TaskConditionGroup, error) {
	if depth > MaxTaskConditionDepth {
		return nil, fmt.Errorf("groups nest deeper than %d levels", MaxTaskConditionDepth)
	}
	if *w.Match != "all" && *w.Match != "any" {
		return nil, fmt.Errorf("unknown match %q", *w.Match)
	}

	group := &TaskConditionGroup{Match: *w.Match}
	for _, child := range w.Children {
		*nodes++
		if *nodes > maxTaskConditionNodes {
			return nil, fmt.Errorf("more than %d conditions", maxTaskConditionNodes)
		}
		if child.Match != nil {
			sub, err := parseConditionGroup(child, depth+1, nodes)
			if err != nil {
				return nil, err
			}
			group.Children = append(group.Children, TaskConditionNode{Group: sub})
			continue
		}
		cond, err := parseCondition(child)
		if err != nil {
			return nil, err
		}
		group.Children = append(group.Children, TaskConditionNode{Condition: cond})
	}
	return group, nil
}

func parseCondition(w wireConditionNode) (*TaskCondition, error) {
	prop, ok := taskConditionProperties[w.Property]
	if !ok {
		return nil, fmt.Errorf("unknown property %q", w.Property)
	}
	cond := &TaskCondition{Property: w.Property, Operator: w.Operator}
	invalidOp := fmt.Errorf("operator %q is not valid for %s", w.Operator, w.Property)

	if _, ok := prop.flagOps[w.Operator]; ok {
		return cond, nil
	}

	switch w.Operator {
	case "is_empty", "is_not_empty", "is_set", "is_not_set":
		isDate := prop.kind == conditionValueDate
		isSetOp := w.Operator == "is_set" || w.Operator == "is_not_set"
		if prop.emptyExpr == "" || isDate != isSetOp {
			return nil, invalidOp
		}
		return cond, nil
	}

	switch prop.kind {
	case conditionValueInt, conditionValueString:
		if w.Operator != "is" && w.Operator != "is_not" {
			return nil, invalidOp
		}
		if len(w.Values) == 0 {
			return nil, fmt.Errorf("%s %s needs at least one value", w.Property, w.Operator)
		}
		values, err := typedConditionValues(w.Values, prop)
		if err != nil {
			return nil, fmt.Errorf("%s: %w", w.Property, err)
		}
		cond.Values = values

	case conditionValueDate:
		switch w.Operator {
		case "before", "after":
			at, err := timefmt.Normalize(w.At)
			if err != nil {
				return nil, fmt.Errorf("%s %s: invalid date: %w", w.Property, w.Operator, err)
			}
			cond.At = at
		case "on", "between":
			from, err := timefmt.Normalize(w.From)
			if err != nil {
				return nil, fmt.Errorf("%s %s: invalid from: %w", w.Property, w.Operator, err)
			}
			to, err := timefmt.Normalize(w.To)
			if err != nil {
				return nil, fmt.Errorf("%s %s: invalid to: %w", w.Property, w.Operator, err)
			}
			cond.From, cond.To = from, to
		default:
			return nil, invalidOp
		}

	case conditionValuePresence:
		return nil, invalidOp

	case conditionValueLink:
		if w.Operator != "is" && w.Operator != "is_not" {
			return nil, invalidOp
		}
		if w.LinkType == nil {
			return nil, errors.New("taskLink needs a linkType")
		}
		if w.Direction != "from" && w.Direction != "to" {
			return nil, fmt.Errorf("taskLink direction %q must be from or to", w.Direction)
		}
		cond.LinkType, cond.Direction = *w.LinkType, w.Direction
		match, ids, err := linkConditionValues(w.Values)
		if err != nil {
			return nil, fmt.Errorf("taskLink: %w", err)
		}
		cond.LinkMatch, cond.Values = match, ids

	case conditionValueText:
		if !containsString(textOperators, w.Operator) {
			return nil, invalidOp
		}
		if w.Text == "" {
			return nil, fmt.Errorf("%s %s needs text", w.Property, w.Operator)
		}
		cond.Text = w.Text
	}

	return cond, nil
}

// typedConditionValues converts decoded JSON values to the column's Go type,
// rejecting anything that couldn't match (a string for an ID, a fractional
// number, a priority outside the CHECK set).
func typedConditionValues(raw []any, prop taskConditionProperty) ([]any, error) {
	out := make([]any, 0, len(raw))
	for _, v := range raw {
		switch prop.kind {
		case conditionValueInt:
			n, ok := v.(json.Number)
			if !ok {
				return nil, fmt.Errorf("value %v is not an id", v)
			}
			f, err := n.Float64()
			if err != nil || f != math.Trunc(f) {
				return nil, fmt.Errorf("value %v is not an id", v)
			}
			out = append(out, int(f))
		case conditionValueString:
			s, ok := v.(string)
			if !ok {
				return nil, fmt.Errorf("value %v is not a string", v)
			}
			if prop.allowed != nil && !containsString(prop.allowed, s) {
				return nil, fmt.Errorf("value %q is not allowed", s)
			}
			out = append(out, s)
		}
	}
	return out, nil
}

// linkConditionValues accepts either one "any" / "none" sentinel on its own
// or one or more task ids — mixing them has no sensible meaning.
func linkConditionValues(raw []any) (string, []any, error) {
	if len(raw) == 0 {
		return "", nil, errors.New("needs at least one value")
	}
	if s, ok := raw[0].(string); ok {
		if len(raw) != 1 || (s != "any" && s != "none") {
			return "", nil, errors.New(`"any" and "none" must be the only value`)
		}
		return s, nil, nil
	}
	ids, err := typedConditionValues(raw, taskConditionProperty{kind: conditionValueInt})
	return "", ids, err
}

func containsString(list []string, s string) bool {
	for _, item := range list {
		if item == s {
			return true
		}
	}
	return false
}

// compileTaskConditions renders a validated tree as one parenthesised SQL
// predicate plus its bind args, in placeholder order. An empty group is a
// no-op (1=1) for both match modes, mirroring the client, which strips empty
// groups before sending.
func compileTaskConditions(group *TaskConditionGroup) (string, []any) {
	if len(group.Children) == 0 {
		return "1=1", nil
	}

	joiner := " AND "
	if group.Match == "any" {
		joiner = " OR "
	}

	parts := make([]string, 0, len(group.Children))
	var args []any
	for _, child := range group.Children {
		var part string
		var childArgs []any
		if child.Group != nil {
			part, childArgs = compileTaskConditions(child.Group)
		} else {
			part, childArgs = compileTaskCondition(child.Condition)
		}
		parts = append(parts, part)
		args = append(args, childArgs...)
	}
	return "(" + strings.Join(parts, joiner) + ")", args
}

func compileTaskCondition(cond *TaskCondition) (string, []any) {
	prop := taskConditionProperties[cond.Property]

	if predicate, ok := prop.flagOps[cond.Operator]; ok {
		return predicate, nil
	}
	if prop.kind == conditionValueLink {
		return compileTaskLink(cond)
	}

	switch cond.Operator {
	case "is":
		return prop.column + " IN (" + conditionPlaceholders(len(cond.Values)) + ")", cond.Values
	case "is_not":
		notIn := prop.column + " NOT IN (" + conditionPlaceholders(len(cond.Values)) + ")"
		// "is not X" means everything except X — unset values included.
		// Without this, SQL's NULL NOT IN (...) is NULL and drops them.
		if prop.emptyExpr != "" {
			return "(" + prop.emptyExpr + " OR " + notIn + ")", cond.Values
		}
		return notIn, cond.Values
	case "is_empty", "is_not_set":
		return prop.emptyExpr, nil
	case "is_not_empty", "is_set":
		return "NOT " + prop.emptyExpr, nil

	// Date operators use overlap ("touches") semantics against the task's
	// effective window: before matches anything that starts before the bound,
	// after anything that ends after it, and on/between any window that
	// intersects the range. NULL bounds compare to NULL, so unplanned tasks
	// never match.
	case "before":
		return prop.start + " < ?", []any{cond.At}
	case "after":
		return prop.end + " > ?", []any{cond.At}
	case "on", "between":
		return "(" + prop.start + " <= ? AND " + prop.end + " >= ?)", []any{cond.To, cond.From}

	case "contains":
		return prop.column + ` LIKE ? ESCAPE '\'`, []any{likeContains(cond.Text)}
	case "does_not_contain":
		return prop.column + ` NOT LIKE ? ESCAPE '\'`, []any{likeContains(cond.Text)}
	case "equals":
		return prop.column + " = ? COLLATE NOCASE", []any{cond.Text}
	case "not_equals":
		return prop.column + " <> ? COLLATE NOCASE", []any{cond.Text}
	}

	// Unreachable for a tree from ParseTaskConditions.
	return "1=1", nil
}

// compileTaskLink renders one direction of one relationship type. "is" asks
// for a link to any of the given tasks (or to any task at all for the "any"
// sentinel); "is not" negates it, so tasks with no such link match. "none" is
// the negation of "any".
func compileTaskLink(cond *TaskCondition) (string, []any) {
	self, other := "fromTask", "toTask"
	if cond.Direction == "to" {
		self, other = "toTask", "fromTask"
	}

	args := []any{cond.LinkType}
	targets := ""
	if cond.LinkMatch == "" {
		targets = " AND r." + other + " IN (" + conditionPlaceholders(len(cond.Values)) + ")"
		args = append(args, cond.Values...)
	}
	exists := fmt.Sprintf(taskLinkExists, self, targets)

	positive := cond.Operator == "is"
	if cond.LinkMatch == "none" {
		positive = !positive
	}
	if positive {
		return exists, args
	}
	return "NOT " + exists, args
}

func conditionPlaceholders(n int) string {
	return strings.TrimRight(strings.Repeat("?,", n), ",")
}

// likeContains escapes LIKE wildcards so user text matches literally.
func likeContains(text string) string {
	escaped := strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`).Replace(text)
	return "%" + escaped + "%"
}
