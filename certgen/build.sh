#!/bin/bash
set -e

GOOS=js GOARCH=wasm go build -ldflags="-s -w" -trimpath -o certgen.wasm
