import { BrowserWindow, ipcMain, shell, WebContents } from 'electron';
import { Certificate, CertificateRequest } from '../shared/types';
import { Dialog } from './dialog';
import { Exporter } from './exporter';
import { Menu } from './menu';
import * as manifest from '../../package.json';
import { certgen } from './certgen';
import { Updater } from './updater';
import { Importer } from './importer';
import { OptionsManager } from './options_manager';
import { Options } from '../shared/options';

const browserWindowFromEvent = (sender: WebContents): BrowserWindow => {
    const windows = BrowserWindow.getAllWindows().filter(window => window.webContents.id === sender.id);
    return windows[0];
};

ipcMain.handle('get_title', event => {
    const window = browserWindowFromEvent(event.sender);
    return Promise.resolve(window.title);
});

ipcMain.handle('export_certificates', async (event, args) => {
    const requests = args[0] as CertificateRequest[];
    const importedRoot = args[1] as Certificate;
    try {
        await Exporter.Export(browserWindowFromEvent(event.sender), requests, importedRoot);
    } catch (err) {
        new Dialog(browserWindowFromEvent(event.sender)).showErrorDialog('Error exporting certificates',
            'An error occurred while generating your certificates', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
});

ipcMain.handle('show_certificate_context_menu', async (event, args) => {
    const isRoot = args[0] as boolean;

    if (isRoot) {
        return Menu.showRootCertificateContextMenu(browserWindowFromEvent(event.sender));
    }

    return Menu.showLeafCertificateContextMenu(browserWindowFromEvent(event.sender));
});

ipcMain.handle('clone_certificate', async (event) => {
    const window = browserWindowFromEvent(event.sender);
    return Importer.Clone(window);
});

ipcMain.handle('runtime_versions', async () => {
    const app = manifest.version;
    const electron = manifest.dependencies.electron;
    const nodejs = process.version.substr(1);
    const golang = await certgen.getVersion();

    return {
        app: app,
        electron: electron,
        nodejs: nodejs,
        golang: golang,
    };
});

ipcMain.on('open_in_browser', (event, args) => {
    shell.openExternal(args[0]);
});

ipcMain.on('fatal_error', (event, args) => {
    const error = args[0] as Error;
    const errorInfo = args[1] as React.ErrorInfo;
    console.error('Fatal error from renderer: ' + error + errorInfo.componentStack);
    const window = browserWindowFromEvent(event.sender);

    new Dialog(window).showFatalErrorDialog().then(() => {
        window.reload();
    });
});

ipcMain.handle('check_for_updates', async () => {
    const newerVersion = await Updater.GetNewerRelease();

    if (newerVersion == undefined) {
        return undefined;
    }

    return newerVersion.ReleaseURL;
});

ipcMain.handle('show_message_box', async (event, args) => {
    const title = args[0] as string;
    const message = args[1] as string;

    return new Dialog(browserWindowFromEvent(event.sender)).showInfoDialog(title, message);
});

ipcMain.handle('confirm_unencrypted_pem', async event => {
    const window = browserWindowFromEvent(event.sender);
    return await new Dialog(window).showUnencryptedPemWarning();
});

ipcMain.handle('get_options', async () => {
    return OptionsManager.Get();
});

ipcMain.handle('update_options', async (event, args) => {
    const newValue = args[0] as Options;
    return OptionsManager.Set(newValue);
});
