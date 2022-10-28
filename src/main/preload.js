import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('IPC', {
    showCertificateContextMenu: (isRoot) => ipcRenderer.invoke('show_certificate_context_menu', [isRoot]),
    cloneCertificate: () => ipcRenderer.invoke('clone_certificate'),
    runtimeVersions: () => ipcRenderer.invoke('runtime_versions', []),
    openInBrowser: (url) => ipcRenderer.send('open_in_browser', [url]),
    fatalError: (error, errorInfo) => ipcRenderer.send('fatal_error', [error, errorInfo]),
    checkForUpdates: () => ipcRenderer.invoke('check_for_updates'),
    showMessageBox: (title, message) => ipcRenderer.invoke('show_message_box', [title, message]),
    getOptions: () => ipcRenderer.invoke('get_options', []),
    updateOptions: (options) => ipcRenderer.invoke('update_options', [options]),
    onShowAboutDialog: (cb) => ipcRenderer.on('show_about_dialog', cb),
    onDidSelectP12File: (cb) => ipcRenderer.on('did_select_p12_file', cb),
    onDidSelectPEMFile: (cb) => ipcRenderer.on('did_select_pem_file', cb),
    onShowOptionsDialog: (cb) => ipcRenderer.on('show_options_dialog', cb),
    getOutputDirectory: (cb) => ipcRenderer.invoke('get_output_directory', []),
    writeFile: (data, parent, name) => ipcRenderer.invoke('write_file', [data, parent, name]),
});
