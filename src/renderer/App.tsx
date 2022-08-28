import * as React from 'react';
import { AlternateNameType, Certificate, CertificateRequest, ExportFormatType, KeyType } from '../shared/types';
import { CertificateList } from './components/CertificateList';
import { Calendar } from './services/Calendar';
import { Button } from './components/Button';
import { CertificateEdit } from './components/CertificateEdit';
import { IPC } from './services/IPC';
import { Icon } from './components/Icon';
import { Validator } from './services/Validator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Rand } from './services/Rand';
import { Link } from './components/Link';
import { GlobalDialogFrame } from './components/DialogFrame';
import { AboutDialog } from './components/AboutDialog';
import { OptionsDialog } from './components/OptionsDialog';
import { ImportPasswordDialog } from './components/ImportPasswordDialog';
import { ExportDialog } from './components/ExportDialog';
import { ExportCertificateResponse, Wasm } from './services/Wasm';
import '../../css/App.scss';

const blankRequest = (isRoot: boolean): CertificateRequest => {
    const request: CertificateRequest = {
        KeyType: KeyType.KeyTypeECDSA_256,
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

    if (!isRoot) {
        request.AlternateNames = [
            {
                Type: AlternateNameType.DNS,
                Value: ''
            }
        ];
        request.Usage = {
            DigitalSignature: true,
            KeyEncipherment: true,
            ServerAuth: true,
            ClientAuth: true,
        };
        request.IsCertificateAuthority = false;
    }

    return request;
};

interface AppState {
    importedRoot?: Certificate;
    certificates: CertificateRequest[];
    selectedCertificateIdx: number;
    certificateEditKey: string;
}
export const App: React.FC = () => {
    const [State, setState] = React.useState<AppState>({
        certificates: [blankRequest(true)],
        selectedCertificateIdx: 0,
        certificateEditKey: Rand.ID(),
    });
    const [InvalidCertificates, SetInvalidCertificates] = React.useState<{ [index: number]: string }>({});
    const [NewVersionURL, SetNewVersionURL] = React.useState<string>();
    const [IsLoading, SetIsLoading] = React.useState(true);
    const [IsExporting, SetIsExporting] = React.useState(false);

    React.useEffect(() => {
        IPC.onDidSelectP12File((event, args: string[]) => {

            const loadCertificate = (certificate: Certificate) => {
                setState(state => {
                    const certificates = state.certificates;
                    certificates[0] = {
                        KeyType: KeyType.KeyTypeECDSA_256,
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
                    state.certificates = certificates;
                    state.importedRoot = certificate;
                    state.certificateEditKey = Rand.ID();
                    return { ...state };
                });
            };

            GlobalDialogFrame.showDialog(<ImportPasswordDialog onImport={loadCertificate} p12Data={args[0]}/>);
        });

        IPC.checkForUpdates().then(newURL => {
            SetNewVersionURL(newURL);
        });

        IPC.onShowAboutDialog(() => {
            if (!GlobalDialogFrame.dialogOpen()) {
                GlobalDialogFrame.showDialog(<AboutDialog />);
            }
        });

        IPC.onShowOptionsDialog(() => {
            if (!GlobalDialogFrame.dialogOpen()) {
                GlobalDialogFrame.showDialog(<OptionsDialog />);
            }
        });

        // Assert WASM binary loaded
        try {
            const nonce = 'wasm-' + Rand.ID();
            const reply = Wasm.Ping({ nonce: nonce });
            if (reply.nonce !== nonce) {
                throw new Error('bad nonce');
            }
            SetIsLoading(false);
        } catch (ex) {
            console.error('Error performing WASM ping', ex);
            alert('WASM binary not loaded, check devtools.');
        }
    }, []);

    React.useEffect(() => {
        validateCertificates();
    }, [State]);

    const didClickCertificate = (idx: number) => {
        setState(state => {
            state.selectedCertificateIdx = idx;
            state.certificateEditKey = Rand.ID();
            return { ...state };
        });
    };

    const validateCertificates = () => {
        SetInvalidCertificates(invalidCertificates => {
            invalidCertificates = {};
            State.certificates.forEach((certificate, idx) => {
                if (certificate.Imported) {
                    return;
                }

                const invalidReason = Validator.CertificateRequest(certificate);
                if (!invalidReason) {
                    return;
                }

                invalidCertificates[idx] = invalidReason;
            });

            return { ...invalidCertificates };
        });
    };

    const didShowCertificateContextMenu = (idx: number) => {
        const certificate = State.certificates[idx];
        if (certificate.IsCertificateAuthority) {
            IPC.showCertificateContextMenu(true);
        } else {
            IPC.showCertificateContextMenu(false).then(action => {
                switch (action) {
                    case 'delete':
                        setState(state => {
                            let selectedCertificateIdx = state.selectedCertificateIdx;
                            if (idx <= state.selectedCertificateIdx) {
                                selectedCertificateIdx--;
                            }
                            state.certificates.splice(idx, 1);
                            state.selectedCertificateIdx = selectedCertificateIdx;
                            state.certificateEditKey = Rand.ID();
                            return { ...state };
                        });
                        break;
                    case 'clone':
                        IPC.cloneCertificate().then(request => {
                            if (!request) {
                                return;
                            }

                            setState(state => {
                                state.certificates[idx] = request;
                                state.certificateEditKey = Rand.ID();
                                return { ...state };
                            });
                        });
                        break;
                    case 'duplicate':
                        setState(state => {
                            const copyCertificate = JSON.parse(JSON.stringify(certificate)) as CertificateRequest;
                            state.certificates.push(copyCertificate);
                            return { ...state };
                        });
                        break;
                }
            });
        }
    };

    const addButtonClick = () => {
        setState(state => {
            const newLength = state.certificates.push(blankRequest(false));
            state.selectedCertificateIdx = newLength - 1;
            state.certificateEditKey = Rand.ID();
            return { ...state };
        });
    };

    const didChangeCertificate = (certificate: CertificateRequest) => {
        setState(state => {
            state.certificates[state.selectedCertificateIdx] = certificate;
            return { ...state };
        });
    };

    const didCancelImport = () => {
        setState(state => {
            state.certificates[0] = blankRequest(true);
            state.certificateEditKey = Rand.ID();
            return { ...state };
        });
    };

    const doExport = async (format: ExportFormatType, password: string) => {
        const handleError = (err: unknown) => {
            console.error('error exporting certificates', err);
            IPC.showMessageBox('error', 'Error exporting certificates', 'An error occured while generating or exporting the certificate and or private keys. See details for more information.', err+'');
        };

        let response: ExportCertificateResponse;
        try {
            response = Wasm.ExportCertificate({
                requests: State.certificates,
                imported_root: State.importedRoot,
                format: format,
                password: password,
            });
        } catch (ex) {
            handleError(ex);
            return;
        }

        let outputDir: string;
        try {
            outputDir = await IPC.getOutputDirectory();
        } catch (ex) {
            handleError(ex);
            return;
        }

        try {
            await Promise.all(response.files.map(f => IPC.writeFile(f.data, outputDir, f.name)));
        } catch (ex) {
            handleError(ex);
            return;
        }

        IPC.showOutputDirectory(outputDir);
        SetIsExporting(false);
    };

    const generateCertificateClick = () => {
        if (GlobalDialogFrame.dialogOpen()) {
            return;
        }

        const dismissed = (format: ExportFormatType, password: string) => {
            doExport(format, password);
        };

        SetIsExporting(true);
        GlobalDialogFrame.showDialog(<ExportDialog dismissed={dismissed} />);
    };

    const addButtonDisabled = () => {
        return State.certificates.length > 128;
    };

    const newVersionBanner = () => {
        if (!NewVersionURL) {
            return null;
        }

        return (<div className="new-version">
            <strong>A newer version is available</strong>
            <Link url={NewVersionURL}>Click here to view</Link>
        </div>);
    };

    const buttonLabel = () => {
        if (IsExporting) {
            return (<Icon.Label icon={<Icon.Spinner pulse />} label="Exporting..." />);
        }

        return (<Icon.Label icon={<Icon.FileExport />} label="Generate Certificates" />);
    };

    if (IsLoading) {
        return (<ErrorBoundary><Icon.Label icon={<Icon.Spinner pulse />} label="Loading..." /></ErrorBoundary>);
    }

    return (<ErrorBoundary>
        <div id="main">
            <div className="certificate-list">
                {newVersionBanner()}
                <CertificateList certificates={State.certificates} selectedIdx={State.selectedCertificateIdx} onClick={didClickCertificate} onShowContextMenu={didShowCertificateContextMenu} invalidCertificates={InvalidCertificates} />
                <div className="certificate-list-footer">
                    <Button onClick={addButtonClick} disabled={addButtonDisabled()}>
                        <Icon.Label icon={<Icon.PlusCircle />} label="Add Certificate" />
                    </Button>
                </div>
            </div>
            <div className="certificate-view">
                <CertificateEdit defaultValue={State.certificates[State.selectedCertificateIdx]} onChange={didChangeCertificate} onCancelImport={didCancelImport} key={State.certificateEditKey} />
            </div>
            <footer>
                <Button onClick={generateCertificateClick} disabled={Object.keys(InvalidCertificates).length > 0 || IsExporting}>
                    {buttonLabel()}
                </Button>
            </footer>
        </div>
        <GlobalDialogFrame />
    </ErrorBoundary>);
};
