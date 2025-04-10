package ui

import (
	"embed"
	"io/fs"
)

var (
	//go:embed dist
	dist embed.FS
)

func Dist() fs.FS {
	fs, err := fs.Sub(dist, "dist")
	if err != nil {
		panic(err)
	}

	return fs
}
