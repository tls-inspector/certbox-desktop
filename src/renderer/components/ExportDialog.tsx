import * as React from 'react';
import { Certificate, CertificateRequest, ExportFormatType } from '../../shared/types';
import { Filesystem } from '../services/Filesystem';
import { ExportedFile, Wasm } from '../services/Wasm';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { Icon } from './Icon';
import { Input } from './Input';
import { Radio } from './Radio';

interface ExportDialogProps {
    requests: CertificateRequest[];
    importedRoot?: Certificate;
}

export const ExportDialog: React.FC<ExportDialogProps> = (props: ExportDialogProps) => {
    const [Format, SetFormat] = React.useState(ExportFormatType.PKCS12);
    const [Password, SetPassword] = React.useState('');
    const [ExportedFiles, SetExportedFiles] = React.useState<ExportedFile[]>();

    const didSelectFormat = (format: string) => {
        SetFormat(format as ExportFormatType);
    };

    const didChangePassword = (password: string) => {
        SetPassword(password);
    };

    const doExport = () => {
        const response = Wasm.ExportCertificate({
            requests: props.requests,
            imported_root: props.importedRoot,
            format: Format,
            password: Password
        });
        SetExportedFiles(response.files);
    };

    const buttons = [
        {
            label: 'Export',
            onClick: () => {
                doExport();
                return false;
            }
        },
        {
            label: 'Cancel'
        }
    ];

    const formatChoices = [
        {
            label: 'P12/PFX',
            value: ExportFormatType.PKCS12
        },
        {
            label: 'PEM',
            value: ExportFormatType.PEM
        }
    ];

    const pemWarningLabel = () => {
        if (Format == ExportFormatType.PEM && Password == '') {
            return (
                <Icon.Label icon={<Icon.ExclamationCircle />} label="Without a password the private key will be exported in plain-text" />
            );
        }

        return null;
    };

    if (ExportedFiles) {
        return (<SaveDialog files={ExportedFiles}/>);
    }

    return (
        <Dialog title="Export Certificates" buttons={buttons}>
            <Radio label="Format" choices={formatChoices} defaultValue={ExportFormatType.PKCS12} onChange={didSelectFormat} />
            <Input label="Password" type="password" onChange={didChangePassword} required={Format == ExportFormatType.PKCS12} />
            {pemWarningLabel()}
        </Dialog>
    );
};

interface SaveDialogProps {
    files: ExportedFile[];
}

const SaveDialog: React.FC<SaveDialogProps> = (props: SaveDialogProps) => {
    const [SavedFiles, SetSavedFiles] = React.useState<{[idx: number]: boolean}>({});

    const buttons = [
        {
            label: 'Save All',
            onClick: () => {
                const response = Wasm.ZipFiles({
                    files: props.files
                });
        
                Filesystem.SaveZIPFile(response.file.name, new Uint8Array(response.file.data));
            }
        },
        {
            label: 'Dismiss'
        }
    ];

    const saveClick = (idx: number, file: ExportedFile) => {
        return () => {
            let p: Promise<void>;

            if (file.name.includes('.p12')) {
                p = Filesystem.SaveP12File(file.name, new Uint8Array(file.data));
            } else if (file.name.includes('.crt')) {
                p = Filesystem.SavePEMCertFile(file.name, new Uint8Array(file.data));
            } else if (file.name.includes('.key')) {
                p = Filesystem.SavePEMKeyFile(file.name, new Uint8Array(file.data));
            }

            p.then(() => {
                SetSavedFiles(f => {
                    f[idx] = true;
    
                    return {...f};
                });
            });
        };
    };

    const saveButton = (idx: number, file: ExportedFile) => {
        if (SavedFiles[idx]) {
            return (<Button onClick={saveClick(idx, file)} disabled><Icon.Label icon={<Icon.CheckCircle color="green" />} label="Saved!" /></Button>);
        }

        return (<Button onClick={saveClick(idx, file)}><Icon.Label icon={<Icon.Save />} label="Save" /></Button>);
    };

    return (
        <Dialog title="Export Certificates" buttons={buttons}>
            <table>
                {
                    props.files.map((file, idx) => {
                        return (
                            <tr key={idx}>
                                <td>{file.name}</td>
                                <td>{saveButton(idx, file)}</td>
                            </tr>
                        );
                    })
                }
            </table>
        </Dialog>
    );
};
