import * as React from 'react';
import { RuntimeVersions } from '../shared/types';
import { IPC } from './services/IPC';
import { Link } from './components/Link';
import { ErrorBoundary } from './components/ErrorBoundary';
import '../../css/App.scss';
import '../../css/Modal.scss';
import '../../css/About.scss';

interface AboutModalState {
    loading: boolean;
    versions?: RuntimeVersions;
}

export class AboutModal extends React.Component<unknown, AboutModalState> {
    constructor(props: unknown) {
        super(props);
        this.state = {
            loading: true,
        };
    }

    componentDidMount(): void {
        IPC.runtimeVersions().then(versions => {
            this.setState({ loading: false, versions: versions });
        });
    }

    render(): JSX.Element {
        if (this.state.loading) { return null; }

        return (<ErrorBoundary>
            <div className="modal about">
                <div className="image">
                    <img src="assets/img/certificate-factory.png" alt="Certificate Factory" />
                </div>
                <div className="contents">
                    <h1>Certificate Factory</h1>
                    <p>Copyright &copy; <Link url="https://ianspence.com">Ian Spence</Link> 2021. Released under the <Link url="https://www.gnu.org/licenses/gpl-3.0.en.html">GPLv3 license</Link>. Source code available at <Link url="https://github.com/tls-inspector/certificate-factory">github.com/tls-inspector/certificate-factory</Link>.</p>
                    <p>
                        Application: <strong>{this.state.versions.app}</strong><br/>
                        Electron: <strong>{this.state.versions.electron}</strong><br/>
                        Node.js: <strong>{this.state.versions.nodejs}</strong><br/>
                    </p>
                </div>
            </div>
        </ErrorBoundary>);
    }
}
