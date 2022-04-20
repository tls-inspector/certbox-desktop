import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { App } from './App';
import { PasswordModal } from './PasswordModal';
import { ExportModal } from './ExportModal';
import { IPC } from './services/IPC';
import { AboutModal } from './AboutModal';
import { OptionsModal } from './OptionsModal';


IPC.getTitle().then(title => {
    switch (title) {
    case 'Certificate Factory':
        ReactDOM.createRoot(document.getElementById('app')).render(<App />);
        break;
    case 'Enter Password':
        ReactDOM.createRoot(document.getElementById('app')).render(<PasswordModal />);
        break;
    case 'Generate Certificates':
        ReactDOM.createRoot(document.getElementById('app')).render(<ExportModal />);
        break;
    case 'About':
        ReactDOM.createRoot(document.getElementById('app')).render(<AboutModal />);
        break;
    case 'Options':
        ReactDOM.createRoot(document.getElementById('app')).render(<OptionsModal />);
        break;
    default:
        alert('Unknown window title ' + title);
        break;
    }
});
