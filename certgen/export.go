package main

import (
	"encoding/json"
	"io"
	"os"
	"path"

	"github.com/tlsinspector/certificate-factory/certgen/tls"
)

// Possible formats
const (
	FormatPEM = "PEM"
	FormatP12 = "PKCS12"
	FormatDER = "DER"
)

// ConfigExportCertificates describes the configuration structure for exporting a certificate
type ConfigExportCertificates struct {
	ExportDir    string
	Certificates []tls.Certificate
	Format       string
	Password     string
}

// ExportedCertificate describes the response from exporting a certificate
type ExportedCertificate struct {
	Files []string
}

func exportCertificates(confReader io.Reader) {
	conf := ConfigExportCertificates{}
	if err := json.NewDecoder(confReader).Decode(&conf); err != nil {
		fatalError(err)
	}

	var root *tls.Certificate
	for _, certificate := range conf.Certificates {
		if !certificate.X509().IsCA {
			continue
		}
		root = &certificate
	}

	response := ExportedCertificate{}

	for _, certificate := range conf.Certificates {
		switch conf.Format {
		case FormatPEM:
			certData, keyData, err := tls.ExportPEM(&certificate)
			if err != nil {
				fatalError(err)
			}
			certFileName := filenameSafeString(certificate.Subject.CommonName) + "_" + certificate.Serial[0:8] + ".crt"
			keyFileName := filenameSafeString(certificate.Subject.CommonName) + "_" + certificate.Serial[0:8] + ".key"

			if err := os.WriteFile(path.Join(conf.ExportDir, certFileName), certData, 0644); err != nil {
				fatalError(err)
			}
			if err := os.WriteFile(path.Join(conf.ExportDir, keyFileName), keyData, 0644); err != nil {
				fatalError(err)
			}

			response.Files = append(response.Files, certFileName, keyFileName)
		case FormatDER:
			certData, keyData, err := tls.ExportDER(&certificate)
			if err != nil {
				fatalError(err)
			}
			certFileName := filenameSafeString(certificate.Subject.CommonName) + "_" + certificate.Serial[0:8] + ".crt"
			keyFileName := filenameSafeString(certificate.Subject.CommonName) + "_" + certificate.Serial[0:8] + ".key"

			if err := os.WriteFile(path.Join(conf.ExportDir, certFileName), certData, 0644); err != nil {
				fatalError(err)
			}
			if err := os.WriteFile(path.Join(conf.ExportDir, keyFileName), keyData, 0644); err != nil {
				fatalError(err)
			}

			response.Files = append(response.Files, certFileName, keyFileName)
		case FormatP12:
			var ca *tls.Certificate
			if !certificate.CertificateAuthority {
				ca = root
			}

			p12Data, err := tls.ExportPKCS12(&certificate, ca, conf.Password)
			if err != nil {
				fatalError(err)
			}

			p12FileName := filenameSafeString(certificate.Subject.CommonName) + "_" + certificate.Serial[0:8] + ".p12"

			if err := os.WriteFile(path.Join(conf.ExportDir, p12FileName), p12Data, 0644); err != nil {
				fatalError(err)
			}

			response.Files = append(response.Files, p12FileName)
		}
	}

	json.NewEncoder(os.Stdout).Encode(response)
}
