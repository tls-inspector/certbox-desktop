import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('IPC', {
    runtimeVersions: () => ipcRenderer.invoke('runtime_versions', []),
    openInBrowser: (url) => ipcRenderer.send('open_in_browser', [url]),
    fatalError: (error, errorInfo) => ipcRenderer.send('fatal_error', [error, errorInfo]),
    checkForUpdates: () => ipcRenderer.invoke('check_for_updates'),
    showMessageBox: (type, title, message, details) => ipcRenderer.invoke('show_message_box', [type, title, message, details]),
    getOptions: () => ipcRenderer.invoke('get_options', []),
    updateOptions: (options) => ipcRenderer.invoke('update_options', [options]),
    onShowAboutDialog: (cb) => ipcRenderer.on('show_about_dialog', cb),
    onShowOptionsDialog: (cb) => ipcRenderer.on('show_options_dialog', cb),
});
