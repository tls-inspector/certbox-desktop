package tls_test

import (
	"testing"
	"time"

	"github.com/tlsinspector/certificate-factory/certgen/tls"
)

func generateCertificateChain() (*tls.Certificate, *tls.Certificate, error) {
	root, err := tls.GenerateCertificate(tls.CertificateRequest{
		Subject: tls.Name{
			Organization: "ecn.io",
			City:         "Vancouver",
			Province:     "British Columbia",
			Country:      "CA",
			CommonName:   "ecn.io Internal Root",
		},
		Validity: tls.DateRange{
			NotBefore: time.Now().AddDate(-1, 0, 0),
			NotAfter:  time.Now().AddDate(20, 0, 0),
		},
		Usage: tls.KeyUsage{
			DigitalSignature: true,
			KeyEncipherment:  true,
			CRLSign:          true,
			OCSPSigning:      true,
		},
		IsCertificateAuthority: true,
	}, nil)
	if err != nil {
		return nil, nil, err
	}

	leaf, err := tls.GenerateCertificate(tls.CertificateRequest{
		Subject: tls.Name{
			Organization: "ecn.io",
			City:         "Vancouver",
			Province:     "British Columbia",
			Country:      "CA",
			CommonName:   "yvr.ecn.io",
		},
		AlternateNames: []tls.AlternateName{
			{
				Type:  tls.AlternateNameTypeDNS,
				Value: "yvr.ecn.io",
			},
			{
				Type:  tls.AlternateNameTypeDNS,
				Value: "*.yvr.ecn.io",
			},
		},
		Validity: tls.DateRange{
			NotBefore: time.Now().AddDate(0, 0, -1),
			NotAfter:  time.Now().AddDate(0, 0, 350),
		},
		Usage: tls.KeyUsage{
			DigitalSignature: true,
			ServerAuth:       true,
			ClientAuth:       true,
		},
	}, root)
	if err != nil {
		return nil, nil, err
	}

	return root, leaf, err
}

func TestGenerateCertificate(t *testing.T) {
	if _, _, err := generateCertificateChain(); err != nil {
		t.Fatalf("Error generating certificate chain: %s", err.Error())
	}
}

func TestDateRange(t *testing.T) {
	dateRange := tls.DateRange{
		NotBefore: time.Now().AddDate(0, -1, 0),
		NotAfter:  time.Now().AddDate(0, 1, 0),
	}
	if !dateRange.IsValid() {
		t.Fatalf("Incorrect date range valid result for valid range")
	}

	dateRange = tls.DateRange{
		NotBefore: time.Now().AddDate(0, 1, 0),
		NotAfter:  time.Now().AddDate(0, 2, 0),
	}
	if dateRange.IsValid() {
		t.Fatalf("Incorrect date range valid result future range")
	}

	dateRange = tls.DateRange{
		NotBefore: time.Now().AddDate(0, -2, 0),
		NotAfter:  time.Now().AddDate(0, -1, 0),
	}
	if dateRange.IsValid() {
		t.Fatalf("Incorrect date range valid result past range")
	}
}
