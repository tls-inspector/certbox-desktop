import { Certificate, CertificateRequest } from '../../shared/types';

export interface WasmError {
    error: string;
}

export interface PingParameters {
	nonce: string;
}

export interface PingResponse {
	nonce: string;
}

export interface ImportCertificateParameters {
    data: string;
    password: string;
}

export interface ImportCertificateResponse {
    certificate: Certificate;
}

export interface CloneCertificateParameters {
    data: string;
}

export interface CloneCertificateResponse {
    certificate: Certificate;
}

export interface ExportCertificateParameters {
    requests: CertificateRequest[];
    imported_root?: Certificate;
    format: string;
    password?: string;
}

export interface ExportedFile {
    name: string;
    data: string;
}

export interface ExportCertificateResponse {
    files: ExportedFile[];
}

interface WasmBridge {
    Ping: (...args: string[]) => string;
    ImportRootCertificate: (...args: string[]) => string;
    CloneRootCertificate: (...args: string[]) => string;
    ExportCertificate: (...args: string[]) => string;
    GetVersion: (...args: string[]) => string;
}

export class Wasm {
    private static wasm: WasmBridge = window as unknown as WasmBridge;

    public static Ping(params: PingParameters): PingResponse {
        const response = JSON.parse(this.wasm.Ping(JSON.stringify(params)));
        if ((response as WasmError).error) {
            throw new Error((response as WasmError).error);
        }
        return response as PingResponse;
    }

    public static ImportRootCertificate(params: ImportCertificateParameters): ImportCertificateResponse {
        const response = JSON.parse(this.wasm.ImportRootCertificate(JSON.stringify(params)));
        if ((response as WasmError).error) {
            throw new Error((response as WasmError).error);
        }
        return response as ImportCertificateResponse;
    }

    public static CloneRootCertificate(params: CloneCertificateParameters): CloneCertificateResponse {
        const response = JSON.parse(this.wasm.CloneRootCertificate(JSON.stringify(params)));
        if ((response as WasmError).error) {
            throw new Error((response as WasmError).error);
        }
        return response as CloneCertificateResponse;
    }

    public static ExportCertificate(params: ExportCertificateParameters): ExportCertificateResponse {
        const response = JSON.parse(this.wasm.ExportCertificate(JSON.stringify(params)));
        if ((response as WasmError).error) {
            throw new Error((response as WasmError).error);
        }
        return response as ExportCertificateResponse;
    }

    public static GetVersion(): string {
        return this.wasm.GetVersion();
    }
}
