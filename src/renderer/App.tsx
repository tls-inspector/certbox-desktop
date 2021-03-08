import * as React from 'react';
import { AlternateNameType, Certificate, CertificateRequest } from '../shared/types';
import { CertificateList } from './components/CertificateList';
import { Calendar } from './services/Calendar';
import { Button } from './components/Button';
import { CertificateEdit } from './components/CertificateEdit';
import { IPC } from './services/IPC';
import { Icon } from './components/Icon';
import { Validator } from './services/Validator';
import { ErrorBoundary } from './components/ErrorBoundary';
import '../../css/App.scss';

interface AppState {
    importedRoot?: Certificate;
    usingImportedRoot?: boolean;
    certificates: CertificateRequest[];
    hasInvalidCertificate: boolean;
    selectedCertificateIdx: number;
}

export class App extends React.Component<unknown, AppState> {
    constructor(props: unknown) {
        super(props);
        this.state = {
            certificates: [App.initialRootCertificate()],
            selectedCertificateIdx: 0,
            hasInvalidCertificate: true,
        };
    }

    private static initialRootCertificate = (): CertificateRequest => {
        return {
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
        this.setState({ selectedCertificateIdx: idx }, () => this.validateCertificates() );
    }

    private validateCertificates = () => {
        this.setState(state => {
            const certificates = state.certificates;
            let allCertificatesValid = true;
            certificates.forEach(certificate => {
                const invalidReason = Validator.CertificateRequest(certificate);
                if (!invalidReason) {
                    certificate.invalid = false;
                    certificate.validationError = undefined;
                    return;
                }

                allCertificatesValid = false;
                certificate.invalid = true;
                certificate.validationError = invalidReason;
            });
            return { certificates: certificates, hasInvalidCertificate: !allCertificatesValid };
        });
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
                        let selectedCertificateIdx = state.selectedCertificateIdx;
                        if (idx <= state.selectedCertificateIdx) {
                            selectedCertificateIdx--;
                        }
                        const certificates = state.certificates;
                        certificates.splice(idx, 1);
                        return { certificates: certificates, selectedCertificateIdx: selectedCertificateIdx };
                    }, () => this.validateCertificates());
                    break;
                case 'duplicate':
                    this.setState(state => {
                        const certificates = state.certificates;
                        const copyCertificate = JSON.parse(JSON.stringify(certificate)) as CertificateRequest;
                        certificates.push(copyCertificate);
                        return { certificates: certificates };
                    }, () => this.validateCertificates());
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
            return { certificates: certificates, selectedCertificateIdx: newIdx-1 };
        }, () => this.validateCertificates());
    }

    private didChangeCertificate = (certificate: CertificateRequest) => {
        this.setState(state => {
            const certificates = state.certificates;
            certificates[state.selectedCertificateIdx] = certificate;
            return { certificates: certificates };
        }, () => this.validateCertificates());
    }

    private didCancelImport = () => {
        this.setState(state => {
            const certificates = state.certificates;
            certificates[0] = App.initialRootCertificate();
            return { certificates: certificates };
        });
    }

    private generateCertificateClick = () => {
        IPC.exportCertificates(this.state.certificates, this.state.importedRoot).then(() => {
            console.info('Generated certificates');
        });
    }

    private addButtonDisabled = () => {
        return this.state.certificates.length > 128;
    }

    render(): JSX.Element {
        return (<ErrorBoundary>
            <div id="main">
                <div className="certificate-list">
                    <CertificateList certificates={this.state.certificates} selectedIdx={this.state.selectedCertificateIdx} onClick={this.didClickCertificate} onShowContextMenu={this.didShowCertificateContextMenu}/>
                    <div className="certificate-list-footer">
                        <Button onClick={this.addButtonClick} disabled={this.addButtonDisabled()}>
                            <Icon.Label icon={<Icon.PlusCircle />} label="Add Certificate" />
                        </Button>
                    </div>
                </div>
                <div className="certificate-view">
                    <CertificateEdit defaultValue={this.state.certificates[this.state.selectedCertificateIdx]} onChange={this.didChangeCertificate} onCancelImport={this.didCancelImport} key={this.state.selectedCertificateIdx}/>
                </div>
                <footer>
                    <Button onClick={this.generateCertificateClick} disabled={this.state.hasInvalidCertificate}>
                        <Icon.Label icon={<Icon.FileExport />} label="Generate Certificates" />
                    </Button>
                </footer>
            </div>
        </ErrorBoundary>);
    }
}
