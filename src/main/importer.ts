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

        const password = await dialog.showPasswordPrompt();
        if (password === undefined) {
            return undefined;
        }

        const data = fs.readFileSync(p12Path, { flag: 'r'}).toString('hex');
        return certgen.importCertificate(data, password);
    }
}
