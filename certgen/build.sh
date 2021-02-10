#!/bin/bash
set -x

GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o certgen_win32_x64
GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o certgen_darwin_x64
# Enable when Go 1.16 is released
# GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o certgen_darwin_arm64
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o certgen_linux_x64
