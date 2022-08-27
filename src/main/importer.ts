import { Dialog } from './dialog';
import fs = require('fs');

export class Importer {
    public static OpenP12(parent: Electron.BrowserWindow) {
        const dialog = new Dialog(parent);
        dialog.browseForP12().then(p12Path => {
            if (p12Path === undefined) {
                return;
            }
            const data = fs.readFileSync(p12Path, { flag: 'r' }).toString('base64');
    
            parent.webContents.send('did_select_p12_file', [data]);
        });
    }
}
