import * as React from 'react';
import { Certificate, CertificateRequest, ExportFormatType } from '../../shared/types';
import { IPC } from '../services/IPC';
import { Dialog } from './Dialog';
import { Icon } from './Icon';
import { Input } from './Input';
import { Radio } from './Radio';

interface ExportDialogProps {
    requests: CertificateRequest[];
    importedRoot?: Certificate;
    dismissed: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = (props: ExportDialogProps) => {
    const [IsLoading, SetIsLoading] = React.useState(true);
    const [Certificates, SetCertificates] = React.useState<Certificate[]>();
    const [Format, SetFormat] = React.useState(ExportFormatType.PKCS12);
    const [Password, SetPassword] = React.useState('');
    const [DidExport, SetDidExport] = React.useState(false);

    React.useEffect(() => {
        IPC.generateCertificate(props.requests, props.importedRoot).then(certificates => {
            SetCertificates(certificates);
            SetIsLoading(false);
        });
    }, []);

    const didSelectFormat = (format: string) => {
        SetFormat(format as ExportFormatType);
        SetPassword('');
    };

    const didChangePassword = (password: string) => {
        SetPassword(password);
    };

    const buttons = [
        {
            label: 'Dismiss',
            onClick: () => {
                props.dismissed();
                return Promise.resolve(true);
            }
        },
        {
            label: 'Save',
            onClick: () => {
                return IPC.exportCertificates(Certificates, Format, Password).then(didExport => {
                    if (didExport) {
                        SetDidExport(true);
                        setTimeout(() => {
                            SetDidExport(false);
                        }, 4000);
                    }
                    return false;
                });
            }
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
        },
        {
            label: 'DER',
            value: ExportFormatType.DER
        }
    ];

    const exportLabel = () => {
        if (!DidExport) {
            return null;
        }

        return (
            <div className="mt-1">
                <Icon.Label icon={<Icon.CheckCircle color='green'/>} label="Certificates & Keys Exported!" />
            </div>
        );
    };

    const passwordInput = () => {
        if (Format != ExportFormatType.PKCS12) {
            return null;
        }

        return (<Input label="Password" type="password" onChange={didChangePassword} required />);
    };

    const plainTextWarning = () => {
        if (Format == ExportFormatType.PKCS12) {
            return null;
        }

        return (
            <div className="mt-1">
                <Icon.Label icon={<Icon.ExclamationTriangle color='yellow' />} label="Private key will be exported in plain-text" />
            </div>
        );
    };

    if (IsLoading) {
        return (
            <Dialog title="Export Certificates" buttons={buttons}>
                <Icon.Label icon={<Icon.Spinner pulse />} label="Generating certificates..." />
            </Dialog>
        );
    }

    return (
        <Dialog title="Export Certificates" buttons={buttons}>
            <Radio label="Format" choices={formatChoices} defaultValue={ExportFormatType.PKCS12} onChange={didSelectFormat} />
            { passwordInput() }
            { plainTextWarning() }
            { exportLabel() }
        </Dialog>
    );
};
