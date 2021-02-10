import * as React from 'react';
import { CertificateRequest } from '../../shared/types';
import '../../../css/CertificateList.scss';

export interface CertificateListProps {
    certificates: CertificateRequest[];
    selectedIdx: number;
    onClick: (idx: number) => void;
    onShowContextMenu: (idx: number) => void;
}
export class CertificateList extends React.Component<CertificateListProps, {}> {
    private didClick = (idx: number) => {
        return () => {
            this.props.onClick(idx);
        };
    }

    private didShowContextMenu = (idx: number) => {
        return () => {
            this.props.onShowContextMenu(idx);
        };
    }

    render(): JSX.Element {
        return (
            <div>
                {
                    this.props.certificates.map((certificate, idx) => {
                        return (<CertificateListItem certificate={certificate} selected={this.props.selectedIdx === idx} onClick={this.didClick(idx)} onShowContextMenu={this.didShowContextMenu(idx)} key={idx} />);
                    })
                }
            </div>
        );
    }
}

interface CertificateListItemProps {
    certificate: CertificateRequest;
    selected?: boolean;
    onClick: () => void;
    onShowContextMenu: () => void;
}
class CertificateListItem extends React.Component<CertificateListItemProps, {}> {
    render(): JSX.Element {
        let image = (<img src="assets/img/CertLargeStd.png" srcSet="assets/img/CertLargeStd@2x.png 2x" />);
        if (this.props.certificate.IsCertificateAuthority) {
            image = (<img src="assets/img/CertLargeRoot.png" srcSet="assets/img/CertLargeRoot@2x.png 2x" />);
        }
        const title = this.props.certificate.Subject.CommonName === '' ? 'Unnamed Certificate' : this.props.certificate.Subject.CommonName;
        let subtitle = '';
        if (this.props.certificate.IsCertificateAuthority) {
            if (this.props.certificate.Imported) {
                subtitle = 'Imported Root Certificate';
            } else {
                subtitle = 'Root Certificate';
            }
        } else {
            subtitle = 'Leaf Certificate';
        }

        const className = 'certificate ' + (this.props.selected ? 'selected' : '');

        return (
            <div className={className} onClick={this.props.onClick} onContextMenu={this.props.onShowContextMenu}>
                { image }
                <div>
                    <span className="title">{ title }</span>
                    <span className="subtitle">{ subtitle }</span>
                </div>
            </div>
        );
    }
}
