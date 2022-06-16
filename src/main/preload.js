import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('IPC', {
    onImportedCertificate: (cb) => ipcRenderer.on('did_import_certificate', cb),
    exportCertificates: (requests, importedRoot, format, password) => ipcRenderer.invoke('export_certificates', [requests, importedRoot, format, password]),
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
    onShowImportPasswordDialog: (cb) => ipcRenderer.on('import_password_dialog_show', cb),
    finishedImportPasswordDialog: (password, cancelled) => ipcRenderer.send('import_password_dialog_finished', [password, cancelled]),
    onShowOptionsDialog: (cb) => ipcRenderer.on('show_options_dialog', cb),
});
