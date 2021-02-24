package main

import (
	"bufio"
	"bytes"
	"fmt"
	"os"
)

// Possible actions
const (
	ActionPing               = "PING"
	ActionImportCertificate  = "IMPORT_CERTIFICATE"
	ActionExportCertificates = "EXPORT_CERTIFICATES"
	ActionGetVersion         = "GET_VERSION"
)

func main() {
	if len(os.Args) != 2 {
		printHelpAndExit()
	}

	action := os.Args[1]

	confData := []byte{}
	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		confData = append(confData, scanner.Bytes()...)
	}

	switch action {
	case ActionPing:
		ping(bytes.NewReader(confData))
		break
	case ActionImportCertificate:
		importCertificate(bytes.NewReader(confData))
		break
	case ActionExportCertificates:
		exportCertificates(bytes.NewReader(confData))
		break
	case ActionGetVersion:
		getVersion()
		break
	}
}

func printHelpAndExit() {
	fmt.Fprint(os.Stderr, "Do not run this application directly, instead use the Certificate Factory application\n\nAlso, Black lives matter and all cops are bastards.\n")
	os.Exit(1)
}

func fatalError(err interface{}) {
	fmt.Fprintf(os.Stderr, "%s\n", err)
	os.Exit(2)
}
