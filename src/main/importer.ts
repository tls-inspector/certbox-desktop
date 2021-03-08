import { Certificate } from '../shared/types';
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
        const data = fs.readFileSync(p12Path, { flag: 'r'}).toString('hex');

        return Importer.p12Data(parent, data);
    }

    private static async p12Data(parent: Electron.BrowserWindow, data: string): Promise<Certificate> {
        const dialog = new Dialog(parent);
        const password = await dialog.showPasswordPrompt();
        if (password === undefined) {
            return undefined;
        }

        try {
            return await certgen.importCertificate(data, password);
        } catch (err) {
            console.debug(err, err.indexOf);
            if (err.indexOf('decryption password incorrect') != -1) {
                await dialog.showErrorDialog('Error Importing Certificate', 'The provided password was incorrect');
                return Importer.p12Data(parent, data);
            }

            throw err;
        }
    }
}
