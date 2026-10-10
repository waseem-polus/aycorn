// Package timefmt owns the single canonical timestamp encoding used across the
// API boundary and SQLite storage.
//
// Every timestamp that crosses a boundary — a query param, a bulk-update JSON
// value, a bind arg — goes through this package. Without it each layer invents
// its own encoding: the modernc driver's default write format is time.Time's
// String() ("2026-06-13 05:00:00 +0000 UTC"), which SQLite's date functions
// cannot parse at all, while the browser sends toISOString() and the triggers
// write CURRENT_TIMESTAMP. Mixed encodings in one column break both range
// comparisons and ORDER BY, since SQLite compares these as plain strings.
package timefmt

import "time"

// Layout is the canonical encoding: RFC3339, second precision, UTC.
//
// Chosen so that lexicographic order equals chronological order (which is what
// SQLite's string comparison actually does) and so SQLite's date()/datetime()
// can parse it. Second precision matters: '...59.999Z' sorts BELOW '...59Z'
// because '.' (0x2E) < 'Z' (0x5A), so fractional seconds would silently break
// boundary comparisons.
const Layout = "2006-01-02T15:04:05Z"

// Format renders a timestamp for storage. Nil-safe so it can wrap optional
// columns directly at a bind site. Returns `any` because that is what a nil
// SQL bind arg has to be.
func Format(t *time.Time) any {
	if t == nil {
		return nil
	}
	return t.UTC().Format(Layout)
}

// Parse reads an incoming timestamp. Accepts any RFC3339 input, including the
// millisecond precision the browser's toISOString() produces.
func Parse(s string) (time.Time, error) {
	return time.Parse(time.RFC3339, s)
}

// Normalize converts an incoming timestamp to the canonical encoding. This is
// the invariant that lets callers be sloppy about precision and offset: an
// input of "2026-08-22T23:59:59.999+02:00" and one of "2026-08-22T21:59:59Z"
// both come out identical and directly comparable to a stored value.
func Normalize(s string) (string, error) {
	t, err := Parse(s)
	if err != nil {
		return "", err
	}
	return t.UTC().Format(Layout), nil
}
