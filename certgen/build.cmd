@echo off

env GOOS=js GOARCH=wasm go build -ldflags="-s -w" -trimpath -o certgen.wasm
