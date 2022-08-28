import * as React from 'react';
import { IPC } from '../services/IPC';
import { Link } from './Link';
import { Dialog } from './Dialog';
import '../../../css/About.scss';

export const AboutDialog: React.FC = () => {
    return (<Dialog title="About Certificate Factory" buttons={[{label: 'Dismiss'}]}>
        <div className="about">
            <div className="image">
                <img src="assets/img/certificate-factory.png" alt="Certificate Factory" />
            </div>
            <div className="contents">
                <h1>Certificate Factory</h1>
                <p>Copyright &copy; <Link url="https://ianspence.com">Ian Spence</Link> 2021-2022. Released under the <Link url="https://www.gnu.org/licenses/gpl-3.0.en.html">GPLv3 license</Link>. Source code available at <Link url="https://github.com/tls-inspector/certificate-factory">github.com/tls-inspector/certificate-factory</Link>.</p>
                <p>{IPC.packageVersion()}</p>
            </div>
        </div>
    </Dialog>);
};
