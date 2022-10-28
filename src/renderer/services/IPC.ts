import { RuntimeVersions } from '../../shared/types';
import { Options } from '../../shared/options';

interface PreloadBridge {
    runtimeVersions: () => Promise<RuntimeVersions>
    openInBrowser: (url: string) => void
    fatalError: (error: unknown, errorInfo: unknown) => void
    checkForUpdates: () => Promise<string>
    showMessageBox: (type: 'info' | 'error' | 'question' | 'warning', title: string, message: string, details?: string) => Promise<void>
    getOptions: () => Promise<Options>
    updateOptions: (options: Options) => Promise<void>
    onShowAboutDialog: (cb: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
    onShowOptionsDialog: (cb: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
}

interface preloadWindow {
    IPC: PreloadBridge
}

export class IPC {
    private static preload: PreloadBridge = (window as unknown as preloadWindow).IPC as PreloadBridge;

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
    public static showMessageBox(type: 'info' | 'error' | 'question' | 'warning', title: string, message: string, details?: string): Promise<void> {
        return IPC.preload.showMessageBox(type, title, message, details);
    }

    /**
     * Get the current options
     * @returns A promise that resolves with the current options
     */
    public static getOptions(): Promise<Options> {
        return IPC.preload.getOptions();
    }

    /**
     * Update the options
     * @param options The new options
     * @returns A promise that resolves when the options have been saved
     */
    public static updateOptions(options: Options): Promise<void> {
        return IPC.preload.updateOptions(options);
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
