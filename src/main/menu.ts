import { app, BrowserWindow, Menu as EMenu } from 'electron';
import { Dialog } from './dialog';
import { Importer } from './importer';

export class Menu {
    public static configureAppMenu(): void {
        const template: Electron.MenuItemConstructorOptions[] = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Import Root Certificate',
                        accelerator: 'CommandOrControl+O',
                        click: () => {
                            this.importMenuClicked(BrowserWindow.getFocusedWindow());
                        },
                    },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                ]
            },
            {
                label: 'View',
                submenu: [
                    { role: 'reload' },
                    { role: 'forceReload' },
                    { role: 'toggleDevTools' },
                    { type: 'separator' },
                    { role: 'resetZoom' },
                    { role: 'zoomIn' },
                    { role: 'zoomOut' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            },
            {
                label: 'Window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'zoom' },
                    { role: 'close' }
                ]
            },
        ];

        if (process.platform === 'darwin') {
            template.splice(0, 0, {
                label: app.name,
                submenu: [
                    {
                        label: 'About Certificate Factory',
                        click: () => {
                            this.aboutMenuClicked(BrowserWindow.getFocusedWindow());
                        },
                    },
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            });
        } else {
            template.push({
                label: 'Help',
                submenu: [
                    {
                        label: 'About Certificate Factory',
                        click: () => {
                            this.aboutMenuClicked(BrowserWindow.getFocusedWindow());
                        },
                    }
                ]
            });
        }

        const menu = EMenu.buildFromTemplate(template);
        EMenu.setApplicationMenu(menu);
    }

    private static aboutMenuClicked = (target: Electron.BrowserWindow) => {
        new Dialog(target).showAboutModal();
    };

    private static importMenuClicked = (target: Electron.BrowserWindow) => {
        Importer.P12(target).then(certificate => {
            if (certificate !== undefined) {
                target.webContents.send('did_import_certificate', [certificate]);
            }
        }, err => {
            new Dialog(target).showErrorDialog('Error', 'Error Importing Certificate', JSON.stringify(err, Object.getOwnPropertyNames(err)));
        });
    };

    public static showRootCertificateContextMenu(target: Electron.BrowserWindow): Promise<string> {
        return new Promise(resolve => {
            const template: Electron.MenuItemConstructorOptions[] = [
                {
                    label: 'Import Existing Root Certificate',
                    click: () => {
                        this.importMenuClicked(target);
                    },
                }
            ];
            const menu = EMenu.buildFromTemplate(template);
            menu.popup({
                window: target,
                callback: () => {
                    resolve(undefined);
                }
            });
        });
    }

    public static showLeafCertificateContextMenu(target: Electron.BrowserWindow): Promise<string> {
        return new Promise(resolve => {
            const template: Electron.MenuItemConstructorOptions[] = [
                {
                    label: 'Duplicate',
                    click: () => {
                        resolve('duplicate');
                    }
                },
                {
                    label: 'Clone Existing Certificate',
                    click: () => {
                        resolve('clone');
                    }
                },
                {
                    label: 'Delete',
                    click: () => {
                        resolve('delete');
                    }
                }
            ];
            const menu = EMenu.buildFromTemplate(template);
            menu.popup({
                window: target,
                callback: () => {
                    resolve(undefined);
                }
            });
        });
    }
}
