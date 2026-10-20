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
	// Text is the substring for contains / does_not_contain.
	Text string
}

type conditionValueKind int

const (
	conditionValueInt conditionValueKind = iota
	conditionValueString
	conditionValueDate
	conditionValueText
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
}

var taskConditionProperties = map[string]taskConditionProperty{
	"project": {kind: conditionValueInt, column: "c.project"},
	// Task listings INNER JOIN checklist, so a task without a checklist is
	// never listed and "checklist is empty" could never match.
	"checklist": {kind: conditionValueInt, column: "t.checklist"},
	"stage":     {kind: conditionValueInt, column: "t.stage"},
	"type":      {kind: conditionValueInt, column: "t.type"},
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

	case conditionValueText:
		if w.Operator != "contains" && w.Operator != "does_not_contain" {
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
	}

	// Unreachable for a tree from ParseTaskConditions.
	return "1=1", nil
}

func conditionPlaceholders(n int) string {
	return strings.TrimRight(strings.Repeat("?,", n), ",")
}

// likeContains escapes LIKE wildcards so user text matches literally.
func likeContains(text string) string {
	escaped := strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`).Replace(text)
	return "%" + escaped + "%"
}
