import { BrowserWindow, ipcMain, webContents } from 'electron';
import { Certificate, CertificateRequest } from '../shared/types';
import { Dialog } from './dialog';
import { Exporter } from './exporter';
import { Menu } from './menu';

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
