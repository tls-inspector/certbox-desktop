import * as React from 'react';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { IPC } from './services/IPC';
import { Radio } from './components/Radio';
import { ExportFormatType } from '../shared/types';
import { ErrorBoundary } from './components/ErrorBoundary';
import '../../css/App.scss';
import '../../css/Modal.scss';

export const ExportModal: React.FC = () => {
    const [Format, setFormat] = React.useState(ExportFormatType.PKCS12);
    const [Password, setPassword] = React.useState('');

    const didChangeFormat = (format: string) => {
        setFormat(format as ExportFormatType);
    };

    const didChangePassword = (password: string) => {
        setPassword(password);
    };

    const cancelClick = () => {
        IPC.dismissExportModal(ExportFormatType.PEM, '', true);
    };

    const confirmExport = () => {
        IPC.dismissExportModal(Format, Password, false);
    };

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

    return (<ErrorBoundary>
        <div className="modal">
            <form onSubmit={confirmExport}>
                <div className="export-content">
                    <Radio label="Format" choices={formatChoices} defaultValue={Format} onChange={didChangeFormat} />
                    <Input label="Encryption Password" type="password" onChange={didChangePassword} required={Format === ExportFormatType.PKCS12}/>
                </div>
                <div className="buttons">
                    <Button onClick={confirmExport}>Export</Button>
                    <Button onClick={cancelClick}>Cancel</Button>
                </div>
            </form>
        </div>
    </ErrorBoundary>);
};
