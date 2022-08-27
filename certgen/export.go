package main

import (
	"encoding/base64"

	"github.com/tlsinspector/certificate-factory/certgen/tls"
)

const (
	FormatPEM = "PEM"
	FormatP12 = "PKCS12"
)

type ExportCertificateParameters struct {
	Requests     []tls.CertificateRequest `json:"requests"`
	ImportedRoot *tls.Certificate         `json:"imported_root"`
	Format       string                   `json:"format"`
	Password     string                   `json:"password"`
}

type ExportCertificateResponse struct {
	Files []ExportedFile `json:"files"`
}

type ExportedFile struct {
	Name string `json:"name"`
	Data string `json:"data"`
}

func ExportCertificate(params ExportCertificateParameters) (*ExportCertificateResponse, error) {
	var certificates = []tls.Certificate{}
	var root tls.Certificate
	if params.ImportedRoot != nil {
		root = *params.ImportedRoot
	} else {
		for _, request := range params.Requests {
			if !request.IsCertificateAuthority {
				continue
			}

			cert, err := tls.GenerateCertificate(request, nil)
			if err != nil {
				return nil, err
			}
			root = *cert
			certificates = append(certificates, *cert)
		}
	}

	for _, request := range params.Requests {
		if request.IsCertificateAuthority {
			continue
		}

		cert, err := tls.GenerateCertificate(request, &root)
		if err != nil {
			return nil, err
		}
		certificates = append(certificates, *cert)
	}

	exportFiles := []ExportedFile{}

	for _, certificate := range certificates {
		switch params.Format {
		case FormatPEM:
			certData, keyData, err := tls.ExportPEM(&certificate, params.Password)
			if err != nil {
				return nil, err
			}
			certFileName := filenameSafeString(certificate.Subject.CommonName) + "_" + certificate.Serial[0:8] + ".crt"
			keyFileName := filenameSafeString(certificate.Subject.CommonName) + "_" + certificate.Serial[0:8] + ".key"

			exportFiles = append(exportFiles, ExportedFile{
				Name: certFileName,
				Data: base64.StdEncoding.EncodeToString(certData),
			})

			exportFiles = append(exportFiles, ExportedFile{
				Name: keyFileName,
				Data: base64.StdEncoding.EncodeToString(keyData),
			})
		case FormatP12:
			var ca *tls.Certificate
			if !certificate.CertificateAuthority {
				ca = &root
			}

			p12Data, err := tls.ExportPKCS12(&certificate, ca, params.Password)
			if err != nil {
				return nil, err
			}

			p12FileName := filenameSafeString(certificate.Subject.CommonName) + "_" + certificate.Serial[0:8] + ".p12"

			exportFiles = append(exportFiles, ExportedFile{
				Name: p12FileName,
				Data: base64.StdEncoding.EncodeToString(p12Data),
			})
		}
	}

	return &ExportCertificateResponse{
		Files: exportFiles,
	}, nil
}
