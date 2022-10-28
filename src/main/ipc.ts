import { BrowserWindow, ipcMain, shell, WebContents } from 'electron';
import { Dialog } from './dialog';
import { Menu } from './menu';
import * as manifest from '../../package.json';
import { Updater } from './updater';
import { OptionsManager } from './options_manager';
import { Options } from '../shared/options';
import fs = require('fs');
import path = require('path');

const browserWindowFromEvent = (sender: WebContents): BrowserWindow => {
    const windows = BrowserWindow.getAllWindows().filter(window => window.webContents.id === sender.id);
    return windows[0];
};

ipcMain.handle('show_certificate_context_menu', async (event, args) => {
    const isRoot = args[0] as boolean;

    if (isRoot) {
        return Menu.showRootCertificateContextMenu(browserWindowFromEvent(event.sender));
    }

    return Menu.showLeafCertificateContextMenu(browserWindowFromEvent(event.sender));
});

ipcMain.handle('runtime_versions', async () => {
    const app = manifest.version;
    const electron = manifest.dependencies.electron;
    const nodejs = process.version.substr(1);

    return {
        app: app,
        electron: electron,
        nodejs: nodejs,
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
    const messageType = args[0] as 'info' | 'error' | 'question' | 'warning';
    const title = args[1] as string;
    const message = args[2] as string;
    const details = args[3] as string;
    console.error({
        type: messageType,
        title: title,
        message: message,
        details: details,
    });

    return new Dialog(browserWindowFromEvent(event.sender)).showMessageBox(messageType, title, message, details);
});

ipcMain.handle('get_options', async () => {
    return OptionsManager.Get();
});

ipcMain.handle('update_options', async (event, args) => {
    const newValue = args[0] as Options;
    return OptionsManager.Set(newValue);
});

ipcMain.handle('get_output_directory', async (event) => {
    const dialog = new Dialog(browserWindowFromEvent(event.sender));
    return dialog.showSelectFolderDialog();
});

ipcMain.handle('write_file', async (event, args): Promise<void> => {
    return new Promise((resolve, reject) => {
        const data = args[0] as string;
        const parent = args[1] as string;
        const name = args[2] as string;

        fs.writeFile(path.join(parent, name), Buffer.from(data, 'base64'), 'binary', (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
});

ipcMain.on('show_output_directory', async (event, args) => {
    if (OptionsManager.Get().ShowExportedCertificates) {
        await shell.openPath(args[0]);
    }
});
