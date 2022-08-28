import { ipcRenderer, contextBridge } from 'electron';
import * as manifest from '../../package.json';

contextBridge.exposeInMainWorld('IsElectron', true);
contextBridge.exposeInMainWorld('IPC', {
    packageVersion: manifest.version,
    packageName: manifest.name,
    openInBrowser: (url) => ipcRenderer.send('open_in_browser', [url]),
    fatalError: (error, errorInfo) => ipcRenderer.send('fatal_error', [error, errorInfo]),
    showMessageBox: (type, title, message, details) => ipcRenderer.invoke('show_message_box', [type, title, message, details]),
    onShowAboutDialog: (cb) => ipcRenderer.on('show_about_dialog', cb),
    onShowOptionsDialog: (cb) => ipcRenderer.on('show_options_dialog', cb),
});
