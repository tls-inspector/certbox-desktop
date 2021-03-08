import * as React from 'react';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { IPC } from './services/IPC';
import { ErrorBoundary } from './components/ErrorBoundary';
import '../../css/App.scss';
import '../../css/Modal.scss';

export const PasswordModal: React.FC = () => {
    const [Password, setPassword] = React.useState('');

    const didChangePassword = (password: string) => {
        setPassword(password);
    };

    const cancelClick = () => {
        IPC.dismissImportPasswordModal('', true);
    };

    const importClick = () => {
        IPC.dismissImportPasswordModal(Password, false);
    };

    return (<ErrorBoundary>
        <div className="modal">
            <form onSubmit={importClick}>
                <Input label="P12 Password" type="password" onChange={didChangePassword} autofocus />
                <div className="buttons">
                    <Button onClick={importClick}>Import</Button>
                    <Button onClick={cancelClick}>Cancel</Button>
                </div>
            </form>
        </div>
    </ErrorBoundary>);
};
