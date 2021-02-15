import { Certificate, CertificateRequest, ExportedCertificate } from "../shared/types";
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { App } from "./app";
import path = require('path');
import fs = require('fs');

export class certgen {
    public static certgenExePath: string = undefined;

    private static async runCertgen(action: 'PING'|'IMPORT_CERTIFICATE'|'EXPORT_CERTIFICATES', config: unknown): Promise<string> {
        return new Promise((resolve, reject) => {
            const args = ['', ''];
            let dir: string;

            try {
                dir = fs.mkdtempSync('certgen');
                const configPath = path.join(dir, 'config.json');
                fs.writeFileSync(configPath, JSON.stringify(config), {
                    flag: 'w+'
                });
                args[0] = action;
                args[1] = configPath;
            } catch (err) {
                console.error('Error saving argument file', err);
                reject(err);
                return;
            }

            let process: ChildProcessWithoutNullStreams;
            try {
                if (!App.isProduction()) { console.log(certgen.certgenExePath, args); }
                process = spawn(certgen.certgenExePath, args);
            } catch (err) {
                console.error('Error spawning process', err);
                reject(err);
                try {
                    fs.rmdirSync(dir, { recursive: true });
                } catch (err) {
                    console.error('Error while cleaning up', err);
                }
                return;
            }

            let output = '';
            process.stdout.on('data', data => {
                if (!App.isProduction()) { console.log(data); }
                output += data;
            });

            let error = '';
            process.stderr.on('data', data => {
                console.error(data);
                error += data;
            });

            process.on('close', code => {
                try {
                    fs.rmdirSync(dir, { recursive: true });
                } catch (err) {
                    console.error('Error while cleaning up', err);
                }

                if (code === 0) {
                    resolve(output);
                } else {
                    console.error('Certgen error', code, error);
                    reject(error);
                }
            });
        });
    }

    public static async test(): Promise<void> {
        const config = {
            Nonce: 'hello world'
        };

        interface pingRespone {
            OK: boolean;
            Nonce: string;
        }

        return this.runCertgen('PING', config).then(output => {
            const response = JSON.parse(output) as pingRespone;
            if (!response.OK || response.Nonce !== config.Nonce) {
                throw new Error('Invalid response from certgen backend');
            }
        });
    }

    public static async importCertificate(data: string, password: string): Promise<Certificate> {
        const config = {
            Data: data,
            Password: password,
        };

        if (!App.isProduction()) { console.log('Importing certificate', config); }
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

        if (!App.isProduction()) { console.log('Exporting certificate', config); }
        return this.runCertgen('EXPORT_CERTIFICATES', config).then(output => {
            return JSON.parse(output) as ExportedCertificate;
        });
    }
}