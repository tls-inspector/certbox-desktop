import * as React from 'react';
import { Certificate } from '../../shared/types';
import { Wasm } from '../services/Wasm';
import { Dialog } from './Dialog';
import { Icon } from './Icon';
import { Input } from './Input';

interface ImportPasswordDialogProps {
    onImport: (certificate: Certificate) => void;
    p12Data: string;
}

export const ImportPasswordDialog: React.FC<ImportPasswordDialogProps> = (props: ImportPasswordDialogProps) => {
    const [Password, SetPassword] = React.useState('');
    const [IncorrectPassword, SetIncorrectPassword] = React.useState(false);

    const didChangePassword = (password: string) => {
        SetPassword(password);
    };

    const buttons = [
        {
            label: 'Import',
            onClick: () => {
                try {
                    const response = Wasm.ImportRootCertificate({
                        data: props.p12Data,
                        password: Password,
                    });
                    props.onImport(response.certificate);
                    return true;
                } catch {
                    SetIncorrectPassword(true);
                    return false;
                }
            }
        },
        {
            label: 'Cancel'
        }
    ];

    const incorrectLabel = () => {
        if (!IncorrectPassword) {
            return null;
        }

        return (<Icon.Label icon={<Icon.ExclamationCircle color="red"/>} label="Incorrect password" />);
    };

    return (
        <Dialog title="Import Certificate" buttons={buttons}>
            {incorrectLabel()}
            <Input label="P12 Password" type="password" onChange={didChangePassword} autofocus />
        </Dialog>
    );
};
