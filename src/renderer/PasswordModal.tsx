import * as React from 'react';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { IPC } from './services/IPC';
import '../../css/App.scss';
import '../../css/Modal.scss';

export interface PasswordModalProps {}
interface PasswordModalState {
    password: string;
}
export class PasswordModal extends React.Component<PasswordModalProps, PasswordModalState> {
    constructor(props: PasswordModalProps) {
        super(props);
        this.state = {
            password: '',
        };
    }

    private didChangePassword = (password: string) => {
        this.setState({ password: password });
    }

    private cancelClick = () => {
        IPC.dismissImportPasswordModal('', true);
    }

    private importClick = () => {
        IPC.dismissImportPasswordModal(this.state.password, false);
    }

    render(): JSX.Element {
        return (
            <div className="modal">
                <form onSubmit={this.importClick}>
                    <Input label="P12 Password" type="password" onChange={this.didChangePassword} autofocus />
                    <div className="buttons">
                        <Button onClick={this.importClick}>Import</Button>
                        <Button onClick={this.cancelClick}>Cancel</Button>
                    </div>
                </form>
            </div>
        );
    }
}
