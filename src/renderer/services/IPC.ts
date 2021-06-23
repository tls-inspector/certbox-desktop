import { Certificate, CertificateRequest, ExportFormatType, RuntimeVersions } from '../../shared/types';

interface PreloadBridge {
    getTitle: () => Promise<string>
    listenForImportedCertificate: (cb: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
    dismissImportPasswordModal: (password: string, cancelled: boolean) => void
    dismissExportModal: (format: ExportFormatType, password: string, cancelled: boolean) => void
    exportCertificates: (requests: CertificateRequest[], importedRoot: Certificate) => Promise<void>
    showCertificateContextMenu: (isRoot: boolean) => Promise<'delete' | 'duplicate'>
    runtimeVersions: () => Promise<RuntimeVersions>
    openInBrowser: (url: string) => void;
    fatalError: (error: unknown, errorInfo: unknown) => void;
    checkForUpdates: () => Promise<string>
    showMessageBox: (title: string, message: string) => Promise<void>
    confirmUnencryptedPEM: () => Promise<boolean>
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
     * Initiate the process of exporting certificates.
     * @param requests List of certificates to generate
     * @param importedRoot Optional imported root certificate
     */
    public static exportCertificates(requests: CertificateRequest[], importedRoot: Certificate): Promise<void> {
        return IPC.preload.exportCertificates(requests, importedRoot);
    }

    /**
     * Show the certificate context menu when the user right clicks on a certificate
     * @param isRoot If the selected certificate is a root certificate
     */
    public static showCertificateContextMenu(isRoot: boolean): Promise<'delete' | 'duplicate'> {
        return IPC.preload.showCertificateContextMenu(isRoot);
    }

    /**
     * Get the versions of various runtime requirements
     * @returns A promise that resolves with a version object
     */
    public static runtimeVersions(): Promise<RuntimeVersions> {
        return IPC.preload.runtimeVersions();
    }

    /**
     * Open the provided URL in the systems default web browser
     * @param url The URL to open. Must be absolute.
     */
    public static openInBrowser(url: string): void {
        return IPC.preload.openInBrowser(url);
    }

    /**
     * Display an error dialog and reload the browser window
     * @param err The error object
     */
    public static fatalError(error: unknown, errorInfo: unknown): void {
        return IPC.preload.fatalError(error, errorInfo);
    }

    /**
     * Get the URL pointing to a newer version of the software
     * @returns A promise that resolves a URL or undefined
     */
    public static checkForUpdates(): Promise<string> {
        return IPC.preload.checkForUpdates();
    }

    /**
     * Show a simple message box with a dismiss button
     * @param title The title of the message box
     * @param message The message contents of the message box
     * @returns A promise that resolves when the message box is dismissed
     */
    public static showMessageBox(title: string, message: string): Promise<void> {
        return IPC.preload.showMessageBox(title, message);
    }

    /**
     * Show a message dialog confirming that the user wishes to export an unencrypted PEM file
     * @returns A promise that resolves true if the user confirmed
     */
    public static confirmUnencryptedPEM(): Promise<boolean> {
        return IPC.preload.confirmUnencryptedPEM();
    }
}
