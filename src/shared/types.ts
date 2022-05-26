export interface Certificate {
    CertificateAuthority: boolean;
    Subject: Name;
    CertificateData: string;
    KeyData: string;
}

export enum KeyType {
	KeyTypeRSA_2048 = 'rsa2048',
	KeyTypeRSA_4096 = 'rsa4096',
	KeyTypeRSA_8192 = 'rsa8192',
	KeyTypeECDSA_256 = 'ecc256',
	KeyTypeECDSA_384 = 'ecc384',
}

export interface CertificateRequest {
    KeyType: KeyType;
    Subject: Name;
    Validity: DateRange;
    AlternateNames?: AlternateName[];
    Usage: KeyUsage;
    IsCertificateAuthority?: boolean;
    Imported?: boolean;
}

export interface Name {
    Organization: string;
    City: string;
    Province: string;
    Country: string;
    CommonName: string;
}

export interface DateRange {
    NotBefore: string;
    NotAfter: string;
}

export interface AlternateName {
    Type: AlternateNameType;
    Value: string
}

export enum AlternateNameType {
    DNS = 'dns',
    Email = 'email',
    IP = 'ip',
    URI = 'uri',
}

export interface ExportParams {
    Format: ExportFormatType;
    Password: string;
}

export enum ExportFormatType {
    PKCS12 = 'PKCS12',
    PEM = 'PEM',
}

export interface KeyUsage {
    // Basic
    DigitalSignature?: boolean;
    ContentCommitment?: boolean;
    KeyEncipherment?: boolean;
    DataEncipherment?: boolean;
    KeyAgreement?: boolean;
    CertSign?: boolean;
    CRLSign?: boolean;
    EncipherOnly?: boolean;
    DecipherOnly?: boolean;

    // Extended
    ServerAuth?: boolean;
    ClientAuth?: boolean;
    CodeSigning?: boolean;
    EmailProtection?: boolean;
    TimeStamping?: boolean;
    OCSPSigning?: boolean;
}

export interface ExportedCertificate {
    Files: string[];
}

export interface RuntimeVersions {
    app: string;
    electron: string;
    nodejs: string;
    golang: string;
}
