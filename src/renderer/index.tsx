import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';
import { PasswordModal } from './PasswordModal';
import { ExportModal } from './ExportModal';
import { IPC } from './services/IPC';

IPC.getTitle().then(title => {
    if (title === 'Certificate Factory') {
        ReactDOM.render(
            <App />,
            document.getElementById('app')
        );
    } else if (title === 'Enter Password') {
        ReactDOM.render(
            <PasswordModal />,
            document.getElementById('app')
        );
    } else if (title === 'Generate Certificates') {
        ReactDOM.render(
            <ExportModal />,
            document.getElementById('app')
        );
    } else {
        alert('Unknown window title ' + title);
    }
});
