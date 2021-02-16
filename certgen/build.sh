#!/bin/bash
set -e

GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o certgen_win32_x64.exe
GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o certgen_darwin_x64
GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o certgen_darwin_arm64
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o certgen_linux_x64
