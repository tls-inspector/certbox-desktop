package main

import (
	"encoding/hex"
	"encoding/json"
	"os"

	"github.com/tlsinspector/certificate-factory/certgen/tls"
)

// ConfigImportCertificate describes the configuration structure for importing a certificate
type ConfigImportCertificate struct {
	Password string
	Data     string
}

func importCertificate(confFilePath string) {
	conf := ConfigImportCertificate{}
	f, err := os.OpenFile(confFilePath, os.O_RDONLY, 0644)
	if err != nil {
		fatalError(err)
	}
	defer closeAndDeleteFile(f)
	if err := json.NewDecoder(f).Decode(&conf); err != nil {
		fatalError(err)
	}

	data, err := hex.DecodeString(conf.Data)
	if err != nil {
		fatalError("invalid P12 data")
	}

	certificate, err := tls.ImportP12(data, conf.Password)
	if err != nil {
		fatalError("error importing P12: " + err.Error())
	}

	json.NewEncoder(os.Stdout).Encode(*certificate)
}
