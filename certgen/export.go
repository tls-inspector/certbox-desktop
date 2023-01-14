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
			certData, keyData, err := tls.ExportPEM(&certificate, conf.Password)
			if err != nil {
				fatalError(err)
			}
			certFileName := filenameSafeString(certificate.Subject.CommonName) + "_" + certificate.Serial[0:8] + ".crt"
			keyFileName := filenameSafeString(certificate.Subject.CommonName) + "_" + certificate.Serial[0:8] + ".key"

			certFile, err := os.OpenFile(path.Join(conf.ExportDir, certFileName), os.O_WRONLY|os.O_CREATE, os.ModePerm)
			if err != nil {
				fatalError(err)
			}
			defer certFile.Close()

			if _, err := certFile.Write(certData); err != nil {
				fatalError(err)
			}

			keyFile, err := os.OpenFile(path.Join(conf.ExportDir, keyFileName), os.O_WRONLY|os.O_CREATE, os.ModePerm)
			if err != nil {
				fatalError(err)
			}
			defer keyFile.Close()

			if _, err := keyFile.Write(keyData); err != nil {
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

			p12File, err := os.OpenFile(path.Join(conf.ExportDir, p12FileName), os.O_WRONLY|os.O_CREATE, os.ModePerm)
			if err != nil {
				fatalError(err)
			}
			defer p12File.Close()

			if _, err := p12File.Write(p12Data); err != nil {
				fatalError(err)
			}

			response.Files = append(response.Files, p12FileName)
		}
	}

	json.NewEncoder(os.Stdout).Encode(response)
}
