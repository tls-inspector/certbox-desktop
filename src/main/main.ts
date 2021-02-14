import { app, BrowserWindow } from 'electron';
import path = require('path');
import os = require('os');
import { Menu } from './menu';
import { certgen } from './certgen';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    console.info('Quitting because of squirrel');
    app.quit();
}

const isProduction = (): boolean => {
    return process.env['DEVELOPMENT'] === undefined;
};

const createWindow = (): void => {
    Menu.configureAppMenu();

    const paths = {
        index: path.join(__dirname, 'index.html'),
        preload: path.join(__dirname, 'preload.js'),
        icon: path.join(__dirname, 'icons', 'certificate-factory.png'),
        certgenExe: path.resolve(__dirname, '..', 'certgen'),
    };
    if (isProduction()) {
        paths.preload = path.resolve('resources', 'app', 'dist', 'preload.js');
        paths.index = path.join('dist', 'index.html');
    } else {
        paths.certgenExe = path.resolve(__dirname, '..', 'certgen', 'certgen_' + os.platform() + '_' + process.arch);
    }
    if (os.platform() === 'win32') {
        paths.icon = path.join(__dirname, 'icons', 'certificate-factory.ico');
        paths.certgenExe += '.exe';
    }
    console.log('Paths:', paths);
    certgen.certgenExePath = paths.certgenExe;

    const options: Electron.BrowserWindowConstructorOptions = {
        height: 600,
        width: 1000,
        webPreferences: {
            sandbox: true,
            preload: paths.preload,
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
    mainWindow.loadFile(paths.index).then(() => {
        console.log('index loaded!');
    }, e => {
        console.error('Error loading', e);
    }).catch(e => {
        console.error('Error loading', e);
    });

    if (!isProduction()) {
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
