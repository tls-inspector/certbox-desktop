import { BrowserWindow, dialog, shell } from 'electron';

export class Dialog {
    private parent: BrowserWindow;

    constructor(parent: BrowserWindow) {
        this.parent = parent;
    }

    /**
     * Show a message box with a single OK button
     * @param type The type of message box
     * @param title The title
     * @param body The body
     * @param details Extra details
     * @returns A promise thats resolved when the box is dismissed
     */
    public showMessageBox = (type: 'info' | 'error' | 'question' | 'warning', title: string, body: string, details?: string): Promise<void> => {
        return dialog.showMessageBox(this.parent, {
            type: type,
            buttons: ['OK'],
            defaultId: 0,
            title: title,
            message: body,
            detail: details,
        }).then(() => {
            return;
        }).catch(err => {
            console.error('Error showing generic dialog', err);
        });
    };

    /**
     * Show a dialog for fatal errors.
     */
    public showFatalErrorDialog = async (): Promise<void> => {
        const result = await dialog.showMessageBox(this.parent, {
            type: 'error',
            buttons: [
                'Report Error & Restart',
                'Restart Certificate Factory'
            ],
            defaultId: 0,
            cancelId: 1,
            title: 'Fatal Error',
            message: 'A non-recoverable error occurred and Certificate Factory must restart. Any unsaved work will be lost. '
        });

        if (result.response == 0) {
            shell.openExternal('https://github.com/tls-inspector/certificate-factory/issues');
        }

        return;
    };
}
