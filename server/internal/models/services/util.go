package services

// dedupeInts returns ids with duplicates removed, preserving first-seen order.
// Bulk endpoints receive raw client ID lists; deduping here keeps BulkResult
// counts honest (otherwise a duplicated or non-existent ID inflates `failed`
// and the UI tells the user to retry forever).
func dedupeInts(ids []int) []int {
	seen := make(map[int]struct{}, len(ids))
	out := make([]int, 0, len(ids))
	for _, id := range ids {
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		out = append(out, id)
	}
	return out
}
