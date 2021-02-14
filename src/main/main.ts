import { app, BrowserWindow } from 'electron';
import { Menu } from './menu';
import { certgen } from './certgen';
import { Paths } from './paths';
import { App } from './app';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    console.info('Quitting because of squirrel');
    app.quit();
}

const createWindow = (): void => {
    Menu.configureAppMenu();

    const paths = Paths.default();
    console.log('Paths:', paths);
    certgen.certgenExePath = paths.certgenEXE;

    const options: Electron.BrowserWindowConstructorOptions = {
        height: 600,
        width: 1000,
        webPreferences: {
            sandbox: true,
            preload: paths.preloadJS,
            worldSafeExecuteJavaScript: true,
            contextIsolation: true,
        },
        autoHideMenuBar: true,
        title: 'Certificate Factory',
        icon: paths.icon,
        show: false
    };

    // Create the browser window.
    const mainWindow = new BrowserWindow(options);

    // and load the index.html of the app.
    mainWindow.loadFile(paths.indexHTML).then(() => {
        console.log('index loaded!');
    }, e => {
        console.error('Error loading', e);
    }).catch(e => {
        console.error('Error loading', e);
    });

    if (!App.isProduction()) {
        // Open the DevTools.
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('ready-to-show', () => {
        console.log('window is ready to show');
        mainWindow.show();
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    console.log('all windows closed');
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
