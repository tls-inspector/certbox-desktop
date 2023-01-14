import * as React from 'react';
import { CertificateRequest } from '../../shared/types';
import { Icon } from './Icon';
import '../../../css/CertificateList.scss';

interface CertificateListProps {
    certificates: CertificateRequest[];
    selectedIdx: number;
    invalidCertificates: {[index:number]:string};
    onClick: (idx: number) => void;
    onShowContextMenu: (idx: number) => void;
}
export const CertificateList: React.FC<CertificateListProps> = (props: CertificateListProps) => {
    const didClick = (idx: number) => {
        return () => {
            props.onClick(idx);
        };
    };

    const didShowContextMenu = (idx: number) => {
        return () => {
            props.onShowContextMenu(idx);
        };
    };

    return (
        <React.Fragment>
            {
                props.certificates.map((certificate, idx) => {
                    return (<CertificateListItem certificate={certificate} selected={props.selectedIdx === idx} onClick={didClick(idx)} onShowContextMenu={didShowContextMenu(idx)} invalidReason={props.invalidCertificates[idx]} key={idx} />);
                })
            }
        </React.Fragment>
    );
};

interface CertificateListItemProps {
    certificate: CertificateRequest;
    selected?: boolean;
    invalidReason?: string;
    onClick: () => void;
    onShowContextMenu: () => void;
}
const CertificateListItem: React.FC<CertificateListItemProps> = (props: CertificateListItemProps) => {
    if (!props.certificate) {
        return null;
    }

    let image = (<img src="assets/img/CertLargeStd.png" srcSet="assets/img/CertLargeStd@2x.png 2x" />);
    if (props.certificate.IsCertificateAuthority) {
        image = (<img src="assets/img/CertLargeRoot.png" srcSet="assets/img/CertLargeRoot@2x.png 2x" />);
    }
    const title = props.certificate.Subject.CommonName === '' ? 'Unnamed Certificate' : props.certificate.Subject.CommonName;
    let subtitle = '';
    if (props.certificate.IsCertificateAuthority) {
        if (props.certificate.Imported) {
            subtitle = 'Imported Root Certificate';
        } else {
            subtitle = 'Root Certificate';
        }
    } else {
        subtitle = 'Leaf Certificate';
    }

    let className = 'certificate ';
    if (props.selected) {
        className += 'selected ';
    }
    if (props.invalidReason) {
        className += 'invalid ';
    }

    let invalid: JSX.Element = null;
    if (props.invalidReason) {
        invalid = (<div className="certificate-invalid">
            <Icon.ExclamationCircle title={props.invalidReason} color='red'/>
        </div>);
    }

    return (
        <div className={className} onClick={props.onClick} onContextMenu={props.onShowContextMenu}>
            { image }
            <div className="certificate-info">
                <span className="title">{ title }</span>
                <span className="subtitle">{ subtitle }</span>
            </div>
            { invalid }
        </div>
    );
};
