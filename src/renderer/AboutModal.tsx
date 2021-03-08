import * as React from 'react';
import { RuntimeVersions } from '../shared/types';
import { IPC } from './services/IPC';
import { Link } from './components/Link';
import { ErrorBoundary } from './components/ErrorBoundary';
import '../../css/App.scss';
import '../../css/Modal.scss';
import '../../css/About.scss';

export const AboutModal: React.FC = () => {
    const [Loading, setLoading] = React.useState(true);
    const [Versions, setVersions] = React.useState<RuntimeVersions>();

    React.useEffect(() => {
        IPC.runtimeVersions().then(versions => {
            setVersions(versions);
            setLoading(false);
        });
    }, []);

    if (Loading) {
        return null;
    }

    return (<ErrorBoundary>
        <div className="modal about">
            <div className="image">
                <img src="assets/img/certificate-factory.png" alt="Certificate Factory" />
            </div>
            <div className="contents">
                <h1>Certificate Factory</h1>
                <p>Copyright &copy; <Link url="https://ianspence.com">Ian Spence</Link> 2021. Released under the <Link url="https://www.gnu.org/licenses/gpl-3.0.en.html">GPLv3 license</Link>. Source code available at <Link url="https://github.com/tls-inspector/certificate-factory">github.com/tls-inspector/certificate-factory</Link>.</p>
                <p>
                    Application: <strong>{Versions.app}</strong><br/>
                    Electron: <strong>{Versions.electron}</strong><br/>
                    Node.js: <strong>{Versions.nodejs}</strong><br/>
                    Golang: <strong>{Versions.golang}</strong><br/>
                </p>
            </div>
        </div>
    </ErrorBoundary>);
};
