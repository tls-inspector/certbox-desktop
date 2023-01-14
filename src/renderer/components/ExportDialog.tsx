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
                        }, 3000);
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
        }
    ];

    const exportLabel = () => {
        if (!DidExport) {
            return null;
        }

        return (
            <Icon.Label icon={<Icon.CheckCircle />} label="Certificates & Keys Exported!" />
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
            <Input label="Password" type="password" onChange={didChangePassword} required={Format == ExportFormatType.PKCS12} />
            {exportLabel()}
        </Dialog>
    );
};
