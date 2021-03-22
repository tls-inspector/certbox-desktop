#!/bin/bash
set -e

if [[ $(uname) == 'Linux' ]]; then
    GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o certgen_linux_x64
    GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o certgen_linux_arm64
fi

if [[ $(uname) == 'Darwin' ]]; then
    GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o certgen_darwin_x64
    GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o certgen_darwin_arm64
fi
