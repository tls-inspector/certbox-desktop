import * as React from 'react';
import { KeyUsage } from '../../shared/types';
import { Checkbox } from './Checkbox';
import { Section } from './Section';
import '../../../css/Checkbox.scss';

export interface KeyUsageEditProps {
    defaultValue: KeyUsage;
    onChange: (request: KeyUsage) => (void);
}

interface KeyUsageEditState {
    value: KeyUsage;
}

export class KeyUsageEdit extends React.Component<KeyUsageEditProps, KeyUsageEditState> {
    constructor(props: KeyUsageEditProps) {
        super(props);
        this.state = {
            value: props.defaultValue,
        };
    }

    private onChangeDigitalSignature = (DigitalSignature: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.DigitalSignature = DigitalSignature;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeContentCommitment = (ContentCommitment: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.ContentCommitment = ContentCommitment;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeKeyEncipherment = (KeyEncipherment: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.KeyEncipherment = KeyEncipherment;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeDataEncipherment = (DataEncipherment: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.DataEncipherment = DataEncipherment;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeKeyAgreement = (KeyAgreement: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.KeyAgreement = KeyAgreement;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeCertSign = (CertSign: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.CertSign = CertSign;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeCRLSign = (CRLSign: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.CRLSign = CRLSign;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeEncipherOnly = (EncipherOnly: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.EncipherOnly = EncipherOnly;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeDecipherOnly = (DecipherOnly: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.DecipherOnly = DecipherOnly;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeServerAuth = (ServerAuth: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.ServerAuth = ServerAuth;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeClientAuth = (ClientAuth: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.ClientAuth = ClientAuth;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeCodeSigning = (CodeSigning: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.CodeSigning = CodeSigning;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeEmailProtection = (EmailProtection: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.EmailProtection = EmailProtection;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeTimeStamping = (TimeStamping: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.TimeStamping = TimeStamping;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeOCSPSigning = (OCSPSigning: boolean) => {
        this.setState(state => {
            const usage = state.value;
            usage.OCSPSigning = OCSPSigning;
            return { value: usage };
        }, () => { this.props.onChange(this.state.value); });
    }


    render(): JSX.Element {
        return (
            <Section title="Key Usage">
                <div className="checkbox-forest">
                    <Checkbox label="Digital Signature" defaultValue={this.state.value.DigitalSignature} onChange={this.onChangeDigitalSignature} />
                    <Checkbox label="Content Commitment" defaultValue={this.state.value.ContentCommitment} onChange={this.onChangeContentCommitment} />
                    <Checkbox label="Key Encipherment" defaultValue={this.state.value.KeyEncipherment} onChange={this.onChangeKeyEncipherment} />
                    <Checkbox label="Data Encipherment" defaultValue={this.state.value.DataEncipherment} onChange={this.onChangeDataEncipherment} />
                    <Checkbox label="Key Agreement" defaultValue={this.state.value.KeyAgreement} onChange={this.onChangeKeyAgreement} />
                    <Checkbox label="Certificate Sign" defaultValue={this.state.value.CertSign} onChange={this.onChangeCertSign} />
                    <Checkbox label="CRL Sign" defaultValue={this.state.value.CRLSign} onChange={this.onChangeCRLSign} />
                    <Checkbox label="Encipher Only" defaultValue={this.state.value.EncipherOnly} onChange={this.onChangeEncipherOnly} />
                    <Checkbox label="Decipher Only" defaultValue={this.state.value.DecipherOnly} onChange={this.onChangeDecipherOnly} />
                    <Checkbox label="Server Authentication" defaultValue={this.state.value.ServerAuth} onChange={this.onChangeServerAuth} />
                    <Checkbox label="Client Authentication" defaultValue={this.state.value.ClientAuth} onChange={this.onChangeClientAuth} />
                    <Checkbox label="Code Signing" defaultValue={this.state.value.CodeSigning} onChange={this.onChangeCodeSigning} />
                    <Checkbox label="Email Protection" defaultValue={this.state.value.EmailProtection} onChange={this.onChangeEmailProtection} />
                    <Checkbox label="Time Stamping" defaultValue={this.state.value.TimeStamping} onChange={this.onChangeTimeStamping} />
                    <Checkbox label="OCSP Signing" defaultValue={this.state.value.OCSPSigning} onChange={this.onChangeOCSPSigning} />
                </div>
            </Section>
        );
    }
}
