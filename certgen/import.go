package main

import (
	"encoding/hex"
	"encoding/json"
	"io"
	"os"

	"github.com/tlsinspector/certificate-factory/certgen/tls"
)

// ConfigImportCertificate describes the configuration structure for importing a certificate
type ConfigImportCertificate struct {
	Password string
	Data     string
}

func importRootCertificate(confReader io.Reader) {
	conf := ConfigImportCertificate{}
	if err := json.NewDecoder(confReader).Decode(&conf); err != nil {
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

func cloneCertificate(confReader io.Reader) {
	conf := ConfigImportCertificate{}
	if err := json.NewDecoder(confReader).Decode(&conf); err != nil {
		fatalError(err)
	}

	data, err := hex.DecodeString(conf.Data)
	if err != nil {
		fatalError("invalid P12 data")
	}

	certificate, err := tls.ImportPEMCertificate(data)
	if err != nil {
		fatalError("error importing pem cert: " + err.Error())
	}

	json.NewEncoder(os.Stdout).Encode(certificate.Clone())
}
