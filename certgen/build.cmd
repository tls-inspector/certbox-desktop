@echo off

env GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o certgen_win32_x64.exe
