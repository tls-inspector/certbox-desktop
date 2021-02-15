package main

import (
	"fmt"
	"os"
)

// Possible actions
const (
	ActionPing               = "PING"
	ActionImportCertificate  = "IMPORT_CERTIFICATE"
	ActionExportCertificates = "EXPORT_CERTIFICATES"
)

func main() {
	if len(os.Args) != 3 {
		printHelpAndExit()
	}

	action := os.Args[1]
	confFilePath := os.Args[2]

	switch action {
	case ActionPing:
		ping(confFilePath)
		break
	case ActionImportCertificate:
		importCertificate(confFilePath)
		break
	case ActionExportCertificates:
		exportCertificates(confFilePath)
		break
	}
}

func closeAndDeleteFile(f *os.File) {
	f.Close()
	os.Remove(f.Name())
}

func printHelpAndExit() {
	fmt.Fprintf(os.Stderr, "Usage: %s <ACTION> <JSON CONFIG FILE>\n", os.Args[0])
	os.Exit(1)
}

func fatalError(err interface{}) {
	fmt.Fprintf(os.Stderr, "%s\n", err)
	os.Exit(2)
}
