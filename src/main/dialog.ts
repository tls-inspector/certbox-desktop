import { BrowserWindow, dialog, ipcMain } from "electron";
import path = require('path');
import fs = require('fs');
import os = require('os');
import { ExportFormatType, ExportParams } from "../shared/types";

export class Dialog {
    private parent: BrowserWindow;

    constructor(parent: BrowserWindow) {
        this.parent = parent;
    }

    private isProduction = (): boolean => {
        return process.env['DEVELOPMENT'] === undefined;
    };

    private showGenericDialog = (type: string, title: string, body: string): Promise<void> => {
        return dialog.showMessageBox(this.parent, {
            type: type,
            buttons: ['OK'],
            defaultId: 0,
            title: title,
            message: body,
        }).then(() => {
            return;
        });
    }

    public showInfoDialog = (title: string, body: string): Promise<void> => {
        return this.showGenericDialog('', title, body);
    }

    public showErrorDialog = (title: string, body: string): Promise<void> => {
        return this.showGenericDialog('', title, body);
    }

    public showWarningDialog = (title: string, body: string): Promise<void> => {
        return this.showGenericDialog('', title, body);
    }


    public showUnencryptedPemWarning(): Promise<boolean> {
        return dialog.showMessageBox(this.parent, {
            type: 'warning',
            buttons: [
                'Cancel',
                'Export (Dangerous)'
            ],
            defaultId: 0,
            title: 'Unencrypted Certificate',
            message: 'Are you sure you want to export your certificate and private in plain-text?',
            cancelId: 0
        }).then(results => {
            return results.response == 1;
        });
    }

    public showSelectFolderDialog(): Promise<string> {
        return dialog.showOpenDialog(this.parent, {
            title: 'Export Certificates',
            buttonLabel: 'Export',
            properties: [ 'openDirectory', 'createDirectory' ]
        }).then(results => {
            if (results.canceled) {
                return undefined;
            }

            return results.filePaths[0];
        });
    }

    public browseForP12(): Promise<string> {
        return dialog.showOpenDialog(this.parent, {
            title: 'Import Certificate',
            buttonLabel: 'Import',
            filters: [{
                name: 'PKCS#12 Archive',
                extensions: [ 'p12', 'pfx' ]
            }]
        }).then(results => {
            if (!results.canceled && results.filePaths.length > 0) {
                return results.filePaths[0];
            }
            return undefined;
        });
    }

    public showPasswordPrompt(): Promise<string> {
        return new Promise((resolve, reject) => {
            const paths = {
                index: 'index.html',
                preload: path.resolve('dist', 'preload.js'),
                icon: path.join(fs.realpathSync('.'), 'dist', 'icons', 'certificate-factory.png')
            };
            if (this.isProduction()) {
                paths.preload = path.resolve('resources', 'app', 'dist', 'preload.js');
                paths.index = path.join('dist', 'index.html');
            }
            if (os.platform() === 'win32') {
                paths.icon = path.join(fs.realpathSync('.'), 'dist', 'icons', 'certificate-factory.ico');
            }
            console.log('Paths:', paths);

            const options: Electron.BrowserWindowConstructorOptions = {
                parent: this.parent,
                height: 120,
                width: 550,
                webPreferences: {
                    sandbox: true,
                    preload: paths.preload,
                    worldSafeExecuteJavaScript: true,
                    contextIsolation: true,
                },
                autoHideMenuBar: true,
                modal: true,
                title: 'Enter Password',
                icon: paths.icon,
                show: false
            };

            const importWindow = new BrowserWindow(options);
            importWindow.loadFile(paths.index).then(() => {
                console.log('index loaded!');
            }, e => {
                console.error('Error loading', e);
                reject(e);
            }).catch(e => {
                console.error('Error loading', e);
                reject(e);
            });

            importWindow.on('ready-to-show', () => {
                importWindow.show();
            });

            let password: string = undefined;
            let cancelled = false;

            ipcMain.on('dismiss_import_password_modal', (event, args) => {
                password = args[0] as string;
                cancelled = args[1] as boolean;
                importWindow.close();
            });

            importWindow.on('closed', () => {
                if (cancelled) {
                    resolve(undefined);
                } else {
                    resolve(password);
                }
                ipcMain.removeAllListeners('dismiss_import_password_modal');
            });
        });
    }

    public showExportDialog(): Promise<ExportParams> {
        return new Promise((resolve, reject) => {
            const paths = {
                index: 'index.html',
                preload: path.resolve('dist', 'preload.js'),
                icon: path.join(fs.realpathSync('.'), 'dist', 'icons', 'certificate-factory.png')
            };
            if (this.isProduction()) {
                paths.preload = path.resolve('resources', 'app', 'dist', 'preload.js');
                paths.index = path.join('dist', 'index.html');
            }
            if (os.platform() === 'win32') {
                paths.icon = path.join(fs.realpathSync('.'), 'dist', 'icons', 'certificate-factory.ico');
            }
            console.log('Paths:', paths);

            const options: Electron.BrowserWindowConstructorOptions = {
                parent: this.parent,
                height: 174,
                width: 550,
                webPreferences: {
                    sandbox: true,
                    preload: paths.preload,
                    worldSafeExecuteJavaScript: true,
                    contextIsolation: true,
                },
                autoHideMenuBar: true,
                modal: true,
                title: 'Export Certificates',
                icon: paths.icon,
                show: false
            };

            const importWindow = new BrowserWindow(options);
            importWindow.loadFile(paths.index).then(() => {
                console.log('index loaded!');
            }, e => {
                console.error('Error loading', e);
                reject(e);
            }).catch(e => {
                console.error('Error loading', e);
                reject(e);
            });

            importWindow.on('ready-to-show', () => {
                importWindow.show();
            });

            let format: ExportFormatType = undefined;
            let password: string = undefined;
            let cancelled = false;

            ipcMain.on('dismiss_export_modal', (event, args) => {
                format = args[0] as ExportFormatType;
                password = args[1] as string;
                cancelled = args[2] as boolean;
                importWindow.close();
            });

            importWindow.on('closed', () => {
                if (cancelled) {
                    resolve(undefined);
                } else {
                    resolve({
                        Format: format,
                        Password: password,
                    });
                }
                ipcMain.removeAllListeners('dismiss_export_modal');
            });
        });
    }
}