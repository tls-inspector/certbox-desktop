import { Certificate, CertificateRequest } from "../shared/types";
import { certgen } from "./certgen";
import { Dialog } from "./dialog";
import { shell } from "electron";

export class Exporter {
    public static async Export(parent: Electron.BrowserWindow, requests: CertificateRequest[], importedRoot: Certificate): Promise<void> {
        const dialog = new Dialog(parent);
        const params = await dialog.showExportDialog();
        if (!params) {
            return;
        }

        const saveDirectory = await dialog.showSelectFolderDialog();
        if (!saveDirectory) {
            return;
        }

        await certgen.exportCertificates(saveDirectory, requests, importedRoot, true, params.Format, params.Password);
        await shell.openPath(saveDirectory);
    }
}
