import * as React from 'react';
import { AlternateNameType, Certificate, CertificateRequest } from '../shared/types';
import { CertificateList } from './components/CertificateList';
import { Calendar } from './services/Calendar';
import { Button } from './components/Button';
import { CertificateEdit } from './components/CertificateEdit';
import { IPC } from './services/IPC';
import { Icon } from './components/Icon';
import '../../css/App.scss';

export interface AppProps {}

interface AppState {
    importedRoot?: Certificate;
    usingImportedRoot?: boolean;
    certificates: CertificateRequest[];
    selectedCertificate: number;
}

export class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            certificates: [
                {
                    Subject: {
                        Organization: '',
                        City: '',
                        Province: '',
                        Country: '',
                        CommonName: '',
                    },
                    Validity: {
                        NotBefore: Calendar.now(),
                        NotAfter: Calendar.addDays(365),
                    },
                    AlternateNames: [],
                    Usage: {
                        DigitalSignature: true,
                        CertSign: true,
                    },
                    IsCertificateAuthority: true
                }
            ],
            selectedCertificate: 0,
        };
    }

    componentDidMount(): void {
        IPC.listenForImportedCertificate((event, args: Certificate[]) => {
            const certificate = args[0];
            this.setState(state => {
                const certificates = state.certificates;
                certificates[0] = {
                    Subject: certificate.Subject,
                    Validity: {
                        NotBefore: Calendar.now(),
                        NotAfter: Calendar.addDays(365),
                    },
                    AlternateNames: [],
                    Usage: {},
                    IsCertificateAuthority: true,
                    Imported: true
                };
                return { certificates: certificates, importedRoot: certificate, usingImportedRoot: true };
            });
            console.log(certificate);
        });
    }

    private didClickCertificate = (idx: number) => {
        this.setState({ selectedCertificate: idx });
    }

    private didShowCertificateContextMenu = (idx: number) => {
        const certificate = this.state.certificates[idx];
        if (certificate.IsCertificateAuthority) {
            IPC.showCertificateContextMenu(true);
        } else {
            IPC.showCertificateContextMenu(false).then(action => {
                switch (action) {
                case 'delete':
                    this.setState(state => {
                        let selectedCertificate = state.selectedCertificate;
                        if (idx <= state.selectedCertificate) {
                            selectedCertificate--;
                        }
                        const certificates = state.certificates;
                        certificates.splice(idx, 1);
                        return { certificates: certificates, selectedCertificate: selectedCertificate };
                    });
                    break;
                case 'duplicate':
                    this.setState(state => {
                        const certificates = state.certificates;
                        const copyCertificate = JSON.parse(JSON.stringify(certificate)) as CertificateRequest;
                        certificates.push(copyCertificate);
                        return { certificates: certificates };
                    });
                    break;
                }
            });
        }
    }

    private addButtonClick = () => {
        this.setState(state => {
            const certificates = state.certificates;
            const newIdx = certificates.push({
                Subject: {
                    Organization: '',
                    City: '',
                    Province: '',
                    Country: '',
                    CommonName: '',
                },
                Validity: {
                    NotBefore: Calendar.now(),
                    NotAfter: Calendar.addDays(365),
                },
                AlternateNames: [
                    {
                        Type: AlternateNameType.DNS,
                        Value: ''
                    }
                ],
                Usage: {
                    DigitalSignature: true,
                    KeyEncipherment: true,
                    ServerAuth: true,
                    ClientAuth: true,
                },
                IsCertificateAuthority: false
            });
            return { certificates: certificates, selectedCertificate: newIdx-1 };
        });
    }

    private didChangeCertificate = (certificate: CertificateRequest) => {
        this.setState(state => {
            const certificates = state.certificates;
            certificates[state.selectedCertificate] = certificate;
            return { certificates: certificates };
        });
    }

    private generateCertificateClick = () => {
        IPC.exportCertificates(this.state.certificates, this.state.importedRoot).then(() => {
            console.info('Generated certificates');
        });
    }

    render(): JSX.Element {
        return (
            <div id="main">
                <div className="certificate-list">
                    <CertificateList certificates={this.state.certificates} selectedIdx={this.state.selectedCertificate} onClick={this.didClickCertificate} onShowContextMenu={this.didShowCertificateContextMenu}/>
                    <div className="certificate-list-footer">
                        <Button onClick={this.addButtonClick}>
                            <Icon.Label icon={<Icon.PlusCircle />} label="Add Certificate" />
                        </Button>
                    </div>
                </div>
                <div className="certificate-view">
                    <CertificateEdit defaultValue={this.state.certificates[this.state.selectedCertificate]} onChange={this.didChangeCertificate} />
                </div>
                <footer>
                    <Button onClick={this.generateCertificateClick}>
                        <Icon.Label icon={<Icon.FileExport />} label="Generate Certificates" />
                    </Button>
                </footer>
            </div>
        );
    }
}
