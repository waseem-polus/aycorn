package models

// COUPLING: this set mirrors STAGE_COLORS in
// app/src/features/stage/stage-palette.ts. Adding/removing a color requires
// editing both lists. Kept deliberately migration-free — stage.color has no
// DB CHECK constraint; the palette is enforced here in the service layer.

var stageColors = map[string]struct{}{
	"gray":    {},
	"slate":   {},
	"red":     {},
	"rose":    {},
	"orange":  {},
	"amber":   {},
	"yellow":  {},
	"lime":    {},
	"green":   {},
	"emerald": {},
	"teal":    {},
	"cyan":    {},
	"sky":     {},
	"blue":    {},
	"indigo":  {},
	"violet":  {},
	"purple":  {},
	"fuchsia": {},
	"pink":    {},
}

func IsValidStageColor(color string) bool {
	_, ok := stageColors[color]
	return ok
}
