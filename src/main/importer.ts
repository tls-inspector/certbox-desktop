import { Certificate, CertificateRequest } from '../shared/types';
import { Dialog } from './dialog';
import fs = require('fs');
import { certgen } from './certgen';

export class Importer {
    public static async P12(parent: Electron.BrowserWindow): Promise<Certificate> {
        const dialog = new Dialog(parent);
        const p12Path = await dialog.browseForP12();
        if (p12Path === undefined) {
            return undefined;
        }
        const data = fs.readFileSync(p12Path, { flag: 'r' }).toString('hex');

        return Importer.p12Data(parent, data);
    }

    private static async p12Data(parent: Electron.BrowserWindow, data: string): Promise<Certificate> {
        const dialog = new Dialog(parent);
        const password = await dialog.showPasswordPrompt();
        if (password === undefined) {
            return undefined;
        }

        try {
            return await certgen.importRootCertificate(data, password);
        } catch (err) {
            console.error('Error importing P12', { error: err });

            if (err.indexOf('decryption password incorrect') != -1) {
                await dialog.showErrorDialog('Error Importing Certificate', 'The provided password was incorrect');
                return Importer.p12Data(parent, data);
            } else if (err.indexOf('expected exactly two safe bags in the PFX PDU') != -1) {
                await dialog.showErrorDialog('Error Importing Certificate', 'The selected certificate does not contain a private key');
                return undefined;
            }

            throw err;
        }
    }

    public static async Clone(parent: Electron.BrowserWindow): Promise<CertificateRequest> {
        const dialog = new Dialog(parent);
        const pemPath = await dialog.browseForPEMCert();
        if (pemPath === undefined) {
            return undefined;
        }
        const data = fs.readFileSync(pemPath, { flag: 'r' }).toString('hex');

        return await certgen.cloneCertificate(data);
    }
}
