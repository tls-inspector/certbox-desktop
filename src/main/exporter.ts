import { Certificate, CertificateRequest } from '../shared/types';
import { certgen } from './certgen';
import { Dialog } from './dialog';
import { shell } from 'electron';
import { log } from './log';
import { OptionsManager } from './options_manager';

export class Exporter {
    private static async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public static async Export(parent: Electron.BrowserWindow, requests: CertificateRequest[], importedRoot: Certificate): Promise<void> {
        const dialog = new Dialog(parent);
        const params = await dialog.showExportDialog();
        if (!params) {
            log.warn('Aborting export, no params');
            return;
        }

        // On macOS, an electron dialog's promise is resolved before the animation of it disappearing is complete.
        // This causes a problem where we will try to show the select folder dialog while there is still an animation
        // occuring, which doesn't generate any errors but blocks execution and just plays the system alert sound.
        //
        // To work around this, we sleep a little bit while we wait for the animation to complete. This is a hack
        // but I don't know how else to work around this.
        if (params.Format === 'PEM' && params.Password === '') {
            await this.sleep(100);
        }

        const saveDirectory = await dialog.showSelectFolderDialog();
        if (!saveDirectory) {
            log.warn('Aborting export, no save directory');
            return;
        }

        log.debug('Exporting certificate', {
            save_directory: saveDirectory,
            format: params.Format,
            password: params.Password,
        });
        await certgen.exportCertificates(saveDirectory, requests, importedRoot, true, params.Format, params.Password);
        
        if (OptionsManager.Get().ShowExportedCertificates) {
            await shell.openPath(saveDirectory);
        }
    }
}
