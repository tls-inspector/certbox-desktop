@echo off

set GOOS=js
set GOARCH=wasm
go build -ldflags="-s -w" -trimpath -o certgen.wasm
