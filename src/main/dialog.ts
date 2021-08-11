import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { ExportFormatType, ExportParams } from '../shared/types';
import { App } from './app';
import { log } from './log';
import { Paths } from './paths';

export class Dialog {
    private parent: BrowserWindow;

    constructor(parent: BrowserWindow) {
        this.parent = parent;
    }

    private showGenericDialog = (type: 'info' | 'error' | 'question' | 'warning', title: string, body: string, details?: string): Promise<void> => {
        return dialog.showMessageBox(this.parent, {
            type: type,
            buttons: ['OK'],
            defaultId: 0,
            title: title,
            message: body,
            detail: details,
        }).then(() => {
            return;
        }).catch(err => {
            console.error('Error showing generic dialog', err);
        });
    };

    /**
     * Show a generic informational dialog
     * @param title The title of the dialog window
     * @param body The body of the dialog
     */
    public showInfoDialog = (title: string, body: string): Promise<void> => {
        return this.showGenericDialog('info', title, body);
    };

    /**
     * Show an error dialog
     * @param title The title of the dialog window
     * @param body The body of the dialog
     * @param details Additional details about the error, this may be collapsed by default on some platforms
     */
    public showErrorDialog = (title: string, body: string, details?: string): Promise<void> => {
        return this.showGenericDialog('error', title, body, details);
    };

    /**
     * Show a dialog for fatal errors.
     */
    public showFatalErrorDialog = async (): Promise<void> => {
        const result = await dialog.showMessageBox(this.parent, {
            type: 'error',
            buttons: [
                'Report Error & Restart',
                'Restart Certificate Factory'
            ],
            defaultId: 0,
            cancelId: 1,
            title: 'Fatal Error',
            message: 'A non-recoverable error occurred and Certificate Factory must restart. Any unsaved work will be lost. '
        });

        if (result.response == 0) {
            shell.openExternal('https://github.com/tls-inspector/certificate-factory/issues');
        }

        return;
    };

    /**
     * Show a generic warning dialog
     * @param title The title of the dialog window
     * @param body The body of the dialog
     */
    public showWarningDialog = (title: string, body: string): Promise<void> => {
        return this.showGenericDialog('warning', title, body);
    };

    public showUnencryptedPemWarning(): Promise<boolean> {
        return dialog.showMessageBox(this.parent, {
            type: 'warning',
            buttons: [
                'Provide Password',
                'Export Private Keys in Plain-Text'
            ],
            defaultId: 0,
            cancelId: 0,
            title: 'Warning',
            message: 'It is strongly recommended that you provide a password to encrypt your private keys. Are you sure you wish to export your private keys in plain text?'
        }).then(results => {
            return results.response == 1;
        });
    }

    public async showSelectFolderDialog(): Promise<string> {
        const results = await dialog.showOpenDialog(this.parent, {
            title: 'Export Certificates',
            buttonLabel: 'Export',
            properties: ['openDirectory', 'createDirectory']
        });
        if (results.canceled) {
            return undefined;
        }
        return results.filePaths[0];
    }

    public browseForP12(): Promise<string> {
        return dialog.showOpenDialog(this.parent, {
            title: 'Import Certificate',
            buttonLabel: 'Import',
            filters: [{
                name: 'PKCS#12 Archive',
                extensions: ['p12', 'pfx']
            }]
        }).then(results => {
            if (!results.canceled && results.filePaths.length > 0) {
                return results.filePaths[0];
            }
            return undefined;
        });
    }

    /**
     * Prepare an electron modal browser window
     * @param title The title of the window
     * @param height The height of the window
     * @param width The width of the window
     * @param modal (Optional) If this window should be a modal or not. Default: true.
     * @returns A promise that resolves with the browser window object when the window was shown to the user
     */
    private electronModal(title: string, height: number, width: number, modal?: boolean): Promise<BrowserWindow> {
        return new Promise((resolve, reject) => {
            const paths = Paths.default();
            const modalWindow = new BrowserWindow({
                parent: this.parent,
                height: height,
                width: width,
                resizable: false,
                maximizable: false,
                minimizable: false,
                webPreferences: {
                    sandbox: true,
                    preload: paths.preloadJS,
                    contextIsolation: true,
                },
                autoHideMenuBar: true,
                modal: modal == undefined ? true : modal,
                title: title,
                icon: paths.icon,
                show: false
            });
            modalWindow.loadFile(paths.indexHTML).then(() => {
                //
            }, e => {
                console.error('Error loading index HTML', e);
                reject(e);
            }).catch(e => {
                console.error('Error loading index HTML', e);
                reject(e);
            });

            if (!App.isProduction()) {
                modalWindow.webContents.openDevTools();
            }

            modalWindow.on('ready-to-show', () => {
                modalWindow.show();
                resolve(modalWindow);
            });
        });
    }

    public showAboutModal(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.electronModal('About', 270, 640, false).then(importWindow => {
                importWindow.on('closed', () => {
                    resolve();
                });
            }).catch(err => {
                reject(err);
            });
        });
    }

    public showPasswordPrompt(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.electronModal('Enter Password', 156, 350).then(importWindow => {
                let password: string = undefined;
                let cancelled = true;

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
            }).catch(err => {
                reject(err);
            });
        });
    }

    public showExportDialog(): Promise<ExportParams> {
        return new Promise((resolve, reject) => {
            this.electronModal('Generate Certificates', 215, 450).then(exportWindow => {
                let format: ExportFormatType = undefined;
                let password: string = undefined;
                let cancelled = true;

                ipcMain.on('dismiss_export_modal', (event, args) => {
                    format = args[0] as ExportFormatType;
                    password = args[1] as string;
                    cancelled = args[2] as boolean;
                    exportWindow.close();
                });

                exportWindow.on('closed', () => {
                    log.debug('Export dialog closed', {
                        format: format,
                        password: password,
                        cancelled: cancelled
                    });
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
            }).catch(err => {
                reject(err);
            });
        });
    }
}
