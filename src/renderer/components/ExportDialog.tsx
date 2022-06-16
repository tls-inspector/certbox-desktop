import * as React from 'react';
import { ExportFormatType } from '../../shared/types';
import { Dialog } from './Dialog';
import { Icon } from './Icon';
import { Input } from './Input';
import { Radio } from './Radio';

interface ExportDialogProps {
    dismissed: (format: ExportFormatType, password: string) => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = (props: ExportDialogProps) => {
    const [Format, SetFormat] = React.useState(ExportFormatType.PKCS12);
    const [Password, SetPassword] = React.useState('');

    const didSelectFormat = (format: string) => {
        SetFormat(format as ExportFormatType);
    };

    const didChangePassword = (password: string) => {
        SetPassword(password);
    };

    const buttons = [
        {
            label: 'Export',
            onClick: () => {
                props.dismissed(Format, Password);
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

    return (
        <Dialog title="Export Certificates" buttons={buttons}>
            <Radio label="Format" choices={formatChoices} defaultValue={ExportFormatType.PKCS12} onChange={didSelectFormat} />
            <Input label="Password" type="password" onChange={didChangePassword} required={Format == ExportFormatType.PKCS12} />
            {pemWarningLabel()}
        </Dialog>
    );
};
