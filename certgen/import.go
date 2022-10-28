package main

import (
	"encoding/base64"

	"github.com/tlsinspector/certificate-factory/certgen/tls"
)

type ImportCertificateParameters struct {
	Data     string `json:"data"`
	Password string `json:"password"`
}

type ImportCertificateResponse struct {
	Certificate tls.Certificate `json:"certificate"`
}

func ImportRootCertificate(params ImportCertificateParameters) (*ImportCertificateResponse, error) {
	data, err := base64.StdEncoding.DecodeString(params.Data)
	if err != nil {
		return nil, err
	}

	certificate, err := tls.ImportP12(data, params.Password)
	if err != nil {
		return nil, err
	}

	return &ImportCertificateResponse{
		Certificate: *certificate,
	}, nil
}

type CloneCertificateParameters struct {
	Data string `json:"data"`
}

type CloneCertificateResponse struct {
	Certificate tls.Certificate `json:"certificate"`
}

func CloneRootCertificate(params CloneCertificateParameters) (*CloneCertificateResponse, error) {
	data, err := base64.StdEncoding.DecodeString(params.Data)
	if err != nil {
		return nil, err
	}

	certificate, err := tls.ImportPEMCertificate(data)
	if err != nil {
		return nil, err
	}

	return &CloneCertificateResponse{
		Certificate: *certificate,
	}, nil
}
