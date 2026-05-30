package main

import (
	"net/url"
	"strconv"
)

func getQuerySlice(q url.Values, key string) []string {
	values, ok := q[key]
	if !ok || len(values) == 0 {
		return []string{}
	}

	if len(values) == 1 && values[0] == "" {
		return []string{}
	}

	return values
}

func getQuerySliceInt(q url.Values, key string) []int {
	strs := getQuerySlice(q, key)
	ints := make([]int, 0, len(strs))
	for _, s := range strs {
		if v, err := strconv.Atoi(s); err == nil {
			ints = append(ints, v)
		}
	}
	return ints
}
