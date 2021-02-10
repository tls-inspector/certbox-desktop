import { Certificate, CertificateRequest, ExportFormatType } from "../../shared/types";

interface PreloadBridge {
    getTitle: () => Promise<string>
    listenForImportedCertificate: (cb: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
    dismissImportPasswordModal: (password: string, cancelled: boolean) => void
    dismissExportModal: (format: ExportFormatType, password: string, cancelled: boolean) => void
    exportCertificates: (requests: CertificateRequest[], importedRoot: Certificate) => Promise<void>
    showCertificateContextMenu: (isRoot: boolean) => Promise<'delete' | 'duplicate'>
}

interface preloadWindow {
    IPC: PreloadBridge
}

export class IPC {
    private static preload: PreloadBridge = (window as unknown as preloadWindow).IPC as PreloadBridge;

    /**
     * Get the title attribute from the BrowserWindow
     * @returns A promise that resolves with a string of the window title
     */
    public static getTitle(): Promise<string> {
        return IPC.preload.getTitle();
    }

    /**
     * Dismiss the import password modal
     * @param password The password
     * @param cancelled If the modal was cancelled
     */
    public static dismissImportPasswordModal(password: string, cancelled: boolean): void {
        IPC.preload.dismissImportPasswordModal(password, cancelled);
    }

    /**
     * Dismiss the export modal
     * @param format The export format to use
     * @param password The encryption password. Must be specified, but for PEM can be an empty string
     * @param cancelled If the modal was cancelled
     */
    public static dismissExportModal(format: ExportFormatType, password: string, cancelled: boolean): void {
        IPC.preload.dismissExportModal(format, password, cancelled);
    }

    /**
     * Register a listener for an imported certificate
     * @param cb callback that is called when a certificate was imported. Args will be Certificate[1]
     */
    public static listenForImportedCertificate(cb: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void): void {
        IPC.preload.listenForImportedCertificate(cb);
    }

    /**
     *
     * @param requests
     * @param importedRoot
     */
    public static exportCertificates(requests: CertificateRequest[], importedRoot: Certificate): Promise<void> {
        return IPC.preload.exportCertificates(requests, importedRoot);
    }

    /**
     *
     * @param x
     * @param y
     * @param isRoot
     */
    public static showCertificateContextMenu(isRoot: boolean): Promise<'delete' | 'duplicate'> {
        return IPC.preload.showCertificateContextMenu(isRoot);
    }
}
