import { BrowserWindow, ipcMain, shell, webContents } from 'electron';
import { Certificate, CertificateRequest } from '../shared/types';
import { Dialog } from './dialog';
import { Exporter } from './exporter';
import { Menu } from './menu';
import * as manifest from '../../package.json';

const browserWindowFromEvent = (sender: webContents): BrowserWindow => {
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
            'An error occurred while generating your certificates.', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
});

ipcMain.handle('show_certificate_context_menu', async (event, args) => {
    const isRoot = args[0] as boolean;

    if (isRoot) {
        return Menu.showRootCertificateContextMenu(browserWindowFromEvent(event.sender));
    }

    return Menu.showLeafCertificateContextMenu(browserWindowFromEvent(event.sender));
});

ipcMain.handle('runtime_versions', () => {
    const app = manifest.version;
    const electron = manifest.dependencies.electron;
    const nodejs = process.version;

    return Promise.resolve({
        app: app,
        electron: electron,
        nodejs: nodejs,
    });
});

ipcMain.on('open_in_browser', (event, args) => {
    shell.openExternal(args[0]);
});

ipcMain.on('fatal_error', (event, args) => {
    const window = browserWindowFromEvent(event.sender);
    new Dialog(window).showErrorDialog(
        'Fatal Error',
        'A non-recoverable error occurred and Certificate Factory must restart. Any unsaved work will be lost. Please report this issue on github.com/tls-inspector/certificate-factory',
        JSON.stringify(args));
    window.reload();
});
