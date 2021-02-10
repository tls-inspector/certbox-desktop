import { Certificate, CertificateRequest, ExportedCertificate } from "../shared/types";
import { spawn } from 'child_process';
import path = require('path');
import fs = require('fs');

export class certgen {
    public static certgenExePath: string = undefined;

    private static async runCertgen(action: 'IMPORT_CERTIFICATE' | 'EXPORT_CERTIFICATES', config: unknown): Promise<string> {
        return new Promise((resolve, reject) => {
            const dir = fs.mkdtempSync('certgen');
            const configPath = path.join(dir, 'config.json');
            fs.writeFileSync(configPath, JSON.stringify(config), {
                flag: 'w+'
            });

            const args = [
                action,
                configPath,
            ];

            console.log(certgen.certgenExePath, args);
            const process = spawn(certgen.certgenExePath, args);

            let output = '';
            process.stdout.on('data', data => {
                console.log(data);
                output += data;
            });

            let error = '';
            process.stderr.on('data', data => {
                console.error(data);
                error += data;
            });

            process.on('close', code => {
                // Cleanup
                fs.rmdirSync(dir, { recursive: true });

                if (code === 0) {
                    resolve(output);
                } else {
                    reject(error);
                }
            });
        });
    }

    public static async importCertificate(data: string, password: string): Promise<Certificate> {
        const config = {
            Data: data,
            Password: password,
        };

        console.log('Importing certificate', config);
        return this.runCertgen('IMPORT_CERTIFICATE', config).then(output => {
            return JSON.parse(output) as Certificate;
        });
    }

    public static async exportCertificates(exportDir: string, requests: CertificateRequest[], importedRoot: Certificate, includeCA: boolean, format: string, password: string): Promise<ExportedCertificate> {
        const config = {
           ExportDir: exportDir,
           Requests: requests,
           ImportedRoot: importedRoot,
           IncludeCA: includeCA,
           Format: format,
           Password: password,
        };

        console.log('Exporting certificate', config);
        return this.runCertgen('EXPORT_CERTIFICATES', config).then(output => {
            return JSON.parse(output) as ExportedCertificate;
        });
    }
}