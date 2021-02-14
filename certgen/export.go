package main

import (
	"encoding/json"
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
	Requests     []tls.CertificateRequest
	ImportedRoot *tls.Certificate
	IncludeCA    bool
	Format       string
	Password     string
}

// ExportedCertificate describes the response from exporting a certificate
type ExportedCertificate struct {
	Files []string
}

func exportCertificates(confFilePath string) {
	conf := ConfigExportCertificates{}
	f, err := os.OpenFile(confFilePath, os.O_RDONLY, 0644)
	if err != nil {
		fatalError(err)
	}
	defer closeAndDeleteFile(f)
	if err := json.NewDecoder(f).Decode(&conf); err != nil {
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

	response := ExportedCertificate{}

	for _, certificate := range certificates {
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
			break
		case FormatP12:
			var ca *tls.Certificate
			if conf.IncludeCA && !certificate.CertificateAuthority {
				ca = &root
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
			break
		}
	}

	json.NewEncoder(os.Stdout).Encode(response)
}
