export class Filesystem {
    public static async ReadP12File(): Promise<Uint8Array> {
        const pickerOpts = {
            types: [
                {
                  description: 'PKCS#12 Archive',
                  accept: { 'application/x-pkcs12': ['.p12', '.pfx'] }
                }
            ],
            excludeAcceptAllOption: true,
            multiple: false,
        };
        
        const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
        const fileData = await fileHandle.getFile();
        const data = await (fileData as Blob).arrayBuffer();
        return new Uint8Array(data);
    }

    public static async ReadPEMFile(): Promise<Uint8Array> {
        const pickerOpts = {
            types: [
                {
                  description: 'PEM Certificate',
                  accept: { 'application/x-pem-file': ['.cer', '.crt', '.pem', '.txt'] }
                }
            ],
            excludeAcceptAllOption: true,
            multiple: false,
        };
        
        const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
        const fileData = await fileHandle.getFile();
        const data = await (fileData as Blob).arrayBuffer();
        return new Uint8Array(data);
    }

    public static async GetOutputDirectory(): Promise<FileSystemDirectoryHandle> {
        return await window.showDirectoryPicker();
    }

    private static async saveFile(data: Uint8Array, suggestedName: string, description: string, mime: string, extensions: string[]): Promise<void> {
        const pickerOpts: SaveFilePickerOptions = {
            types: [
                {
                    description: description,
                    accept: {},
                }
            ],
            suggestedName: suggestedName,
            excludeAcceptAllOption: true
        };
        pickerOpts.types[0].accept[mime] = extensions;
        const fileHandle = await window.showSaveFilePicker(pickerOpts);
        const writer = await fileHandle.createWritable();
        await writer.write(data);
        await writer.close();
    }

    public static async SaveP12File(suggestedName: string, data: Uint8Array): Promise<void> {
        return Filesystem.saveFile(data, suggestedName, 'PKCS#12 archive', 'application/x-pkcs12', ['.p12', '.pfx']);
    }

    public static async SavePEMCertFile(suggestedName: string, data: Uint8Array): Promise<void> {
        return Filesystem.saveFile(data, suggestedName, 'PEM certificate', 'application/x-pem-file', ['.cer', '.crt', '.txt']);
    }

    public static async SavePEMKeyFile(suggestedName: string, data: Uint8Array): Promise<void> {
        return Filesystem.saveFile(data, suggestedName, 'PEM private key', 'application/x-pem-file', ['.key', '.crt', '.txt']);
    }

    public static async SaveZIPFile(suggestedName: string, data: Uint8Array): Promise<void> {
        return Filesystem.saveFile(data, suggestedName, 'Compressed zip archive', 'application/zip', ['.zip']);
    }
}
