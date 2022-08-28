import { app, BrowserWindow, Menu as EMenu } from 'electron';

export class Menu {
    public static configureAppMenu(): void {
        const template: Electron.MenuItemConstructorOptions[] = [
            {
                label: 'File',
                submenu: [
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
                    {
                        label: 'Preferences',
                        click: () => {
                            this.optionsMenuClicked(BrowserWindow.getFocusedWindow());
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
            (template[1].submenu as Electron.MenuItemConstructorOptions[]).push({
                label: 'Preferences',
                click: () => {
                    this.optionsMenuClicked(BrowserWindow.getFocusedWindow());
                },
            });
        }

        const menu = EMenu.buildFromTemplate(template);
        EMenu.setApplicationMenu(menu);
    }

    private static aboutMenuClicked = (target: Electron.BrowserWindow) => {
        target.webContents.send('show_about_dialog');
    };

    private static optionsMenuClicked = (target: Electron.BrowserWindow) => {
        target.webContents.send('show_options_dialog');
    };
}
