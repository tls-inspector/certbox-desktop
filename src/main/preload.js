import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('IPC', {
    getTitle: () => ipcRenderer.invoke('get_title', []),
    listenForImportedCertificate: (cb) => ipcRenderer.on('did_import_certificate', cb),
    dismissImportPasswordModal: (password, cancelled) => ipcRenderer.send('dismiss_import_password_modal', [password, cancelled]),
    dismissExportModal: (format, password, cancelled) => ipcRenderer.send('dismiss_export_modal', [format, password, cancelled]),
    exportCertificates: (requests, importedRoot) => ipcRenderer.invoke('export_certificates', [requests, importedRoot]),
    showCertificateContextMenu: (isRoot) => ipcRenderer.invoke('show_certificate_context_menu', [isRoot]),
    runtimeVersions: () => ipcRenderer.invoke('runtime_versions', []),
    openInBrowser: (url) => ipcRenderer.send('open_in_browser', [url]),
    fatalError: (error, errorInfo) => ipcRenderer.send('fatal_error', [error, errorInfo]),
    checkForUpdates: () => ipcRenderer.invoke('check_for_updates'),
    showMessageBox: (title, message) => ipcRenderer.invoke('show_message_box', [title, message]),
});
