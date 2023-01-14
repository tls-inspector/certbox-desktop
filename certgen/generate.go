package main

import (
	"encoding/json"
	"io"
	"os"

	"github.com/tlsinspector/certificate-factory/certgen/tls"
)

// ConfigGenerateCertificate describes the configuration structure for generating a certificate
type ConfigGenerateCertificate struct {
	Requests     []tls.CertificateRequest
	ImportedRoot *tls.Certificate
}

func generateCertificate(confReader io.Reader) {
	conf := ConfigGenerateCertificate{}
	if err := json.NewDecoder(confReader).Decode(&conf); err != nil {
		fatalError(err)
	}

	var certificates = []tls.Certificate{}
	var root tls.Certificate
	if conf.ImportedRoot != nil {
		root = *conf.ImportedRoot
	} else {
		for _, request := range conf.Requests {
			if !request.IsCertificateAuthority {
				continue
			}

			cert, err := tls.GenerateCertificate(request, nil)
			if err != nil {
				fatalError(err)
			}
			root = *cert
			certificates = append(certificates, *cert)
		}
	}

	for _, request := range conf.Requests {
		if request.IsCertificateAuthority {
			continue
		}

		cert, err := tls.GenerateCertificate(request, &root)
		if err != nil {
			fatalError(err)
		}
		certificates = append(certificates, *cert)
	}

	json.NewEncoder(os.Stdout).Encode(certificates)
}
