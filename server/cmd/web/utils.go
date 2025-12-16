package main

import "net/url"

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
