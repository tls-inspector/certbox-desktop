import { Certificate, CertificateRequest, ExportFormatType } from '../shared/types';
import { Dialog } from './dialog';
import { shell } from 'electron';
import { log } from './log';
import { OptionsManager } from './options_manager';

export class Exporter {
    private static async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public static async Export(parent: Electron.BrowserWindow, requests: CertificateRequest[], importedRoot: Certificate, format: ExportFormatType, password: string): Promise<void> {
        const dialog = new Dialog(parent);

        const saveDirectory = await dialog.showSelectFolderDialog();
        if (!saveDirectory) {
            log.warn('Aborting export, no save directory');
            return;
        }

        log.debug('Exporting certificate', {
            save_directory: saveDirectory,
            format: format,
            password: password,
        });
        //await certgen.exportCertificates(saveDirectory, requests, importedRoot, true, format, password);
        
        if (OptionsManager.Get().ShowExportedCertificates) {
            await shell.openPath(saveDirectory);
        }
    }
}
