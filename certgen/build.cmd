@echo off

env GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o certgen_win32_x64.exe
env GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o certgen_darwin_x64
::Enable when Go 1.16 is released
::env GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o certgen_darwin_arm64
env GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o certgen_linux_x64
