import * as React from 'react';
import { IPC } from '../services/IPC';
import { Dialog } from './Dialog';
import { Input } from './Input';

export const ImportPasswordDialog: React.FC = () => {
    const [Password, SetPassword] = React.useState('');

    const didChangePassword = (password: string) => {
        SetPassword(password);
    };

    const buttons = [
        {
            label: 'Import',
            onClick: () => {
                IPC.finishedImportPasswordDialog(Password, false);
            }
        },
        {
            label: 'Cancel',
            onClick: () => {
                IPC.finishedImportPasswordDialog(undefined, true);
            }
        }
    ];

    return (
        <Dialog title="Import Certificate" buttons={buttons}>
            <Input label="P12 Password" type="password" onChange={didChangePassword} autofocus />
        </Dialog>
    );
};
