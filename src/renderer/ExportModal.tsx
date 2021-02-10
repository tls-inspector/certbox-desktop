import * as React from 'react';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { IPC } from './services/IPC';
import { Radio } from './components/Radio';
import { ExportFormatType } from '../shared/types';
import '../../css/App.scss';
import '../../css/Modal.scss';

export interface ExportModalProps {}
interface ExportModalState {
    format: ExportFormatType;
    password: string;
}
export class ExportModal extends React.Component<ExportModalProps, ExportModalState> {
    constructor(props: ExportModalProps) {
        super(props);
        this.state = {
            format: ExportFormatType.PKCS12,
            password: '',
        };
    }

    private didChangeFormat = (format: string) => {
        this.setState({ format: format as ExportFormatType });
    }

    private didChangePassword = (password: string) => {
        this.setState({ password: password });
    }

    private cancelClick = () => {
        IPC.dismissExportModal(ExportFormatType.PEM, '', true);
    }

    private export = () => {
        IPC.dismissExportModal(this.state.format, this.state.password, false);
    }

    render(): JSX.Element {
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

        return (
            <div className="modal">
                <form onSubmit={this.export}>
                    <div className="export-content">
                        <Radio label="Format" choices={formatChoices} defaultValue={ExportFormatType.PKCS12} onChange={this.didChangeFormat} />
                        <Input label="Encryption Password" type="password" onChange={this.didChangePassword} required={this.state.format === ExportFormatType.PKCS12}/>
                    </div>
                    <div className="buttons">
                        <Button onClick={this.export}>Export</Button>
                        <Button onClick={this.cancelClick}>Cancel</Button>
                    </div>
                </form>
            </div>
        );
    }
}
