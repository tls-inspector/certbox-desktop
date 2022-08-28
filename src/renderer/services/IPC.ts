interface PreloadBridge {
    packageVersion: string;
    packageName: string;
    openInBrowser: (url: string) => void
    fatalError: (error: unknown, errorInfo: unknown) => void
    showMessageBox: (type: 'info' | 'error' | 'question' | 'warning', title: string, message: string, details?: string) => Promise<void>
    onShowAboutDialog: (cb: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
    onShowOptionsDialog: (cb: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
}

interface preloadWindow {
    IPC: PreloadBridge
}

export class IPC {
    private static preload: PreloadBridge = (window as unknown as preloadWindow).IPC as PreloadBridge;

    public static packageVersion(): string {
        return IPC.preload.packageVersion;
    }

    public static packageName(): string {
        return IPC.preload.packageName;
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
     * Show a simple message box with a dismiss button
     * @param title The title of the message box
     * @param message The message contents of the message box
     * @returns A promise that resolves when the message box is dismissed
     */
    public static showMessageBox(type: 'info' | 'error' | 'question' | 'warning', title: string, message: string, details?: string): Promise<void> {
        return IPC.preload.showMessageBox(type, title, message, details);
    }

    /**
     * Register a listener for when the about dialog should be shown
     * @param cb callback
     */
    public static onShowAboutDialog(cb: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void): void {
        IPC.preload.onShowAboutDialog(cb);
    }

    /**
     * Register a listener for when the options dialog should be shown
     * @param cb callback
     */
    public static onShowOptionsDialog(cb: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void): void {
        IPC.preload.onShowOptionsDialog(cb);
    }
}
