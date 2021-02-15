import * as React from 'react';
import { CertificateRequest, DateRange, Name , KeyUsage, AlternateName } from '../../shared/types';
import { Rand } from '../services/Rand';
import { AlternateNamesEdit } from './AlternateNameEdit';
import { DateRangeEdit } from './DateRangeEdit';
import { KeyUsageEdit } from './KeyUsageEdit';
import { NameEdit } from './NameEdit';
import '../../../css/CertificateEdit.scss';
import { Button } from './Button';

export interface CertificateEditProps {
    defaultValue: CertificateRequest;
    onChange: (request: CertificateRequest) => (void);
    onCancelImport: () => (void);
}

interface CertificateEditState {
    value: CertificateRequest;
}

export class CertificateEdit extends React.Component<CertificateEditProps, CertificateEditState> {
    private keys = [
        Rand.ID(),
        Rand.ID(),
        Rand.ID(),
        Rand.ID()
    ];

    constructor(props: CertificateEditProps) {
        super(props);
        this.state = {
            value: props.defaultValue
        };
    }

    componentDidUpdate(prevProps: CertificateEditProps): void {
        if (prevProps.defaultValue !== this.props.defaultValue) {
            this.setState({ value: this.props.defaultValue });
            this.keys = [
                Rand.ID(),
                Rand.ID(),
                Rand.ID(),
                Rand.ID()
            ];
        }
    }

    private onChangeDateRange = (Validity: DateRange) => {
        this.setState(state => {
            const request = state.value;
            request.Validity = Validity;
            return { value: request };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeSubject = (Subject: Name) => {
        this.setState(state => {
            const request = state.value;
            request.Subject = Subject;
            return { value: request };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeAlternateNames = (AlternateNames: AlternateName[]) => {
        this.setState(state => {
            const request = state.value;
            request.AlternateNames = AlternateNames;
            return { value: request };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeKeyUsage = (Usage: KeyUsage) => {
        this.setState(state => {
            const request = state.value;
            request.Usage = Usage;
            return { value: request };
        }, () => { this.props.onChange(this.state.value); });
    }

    render(): JSX.Element {
        if (this.state.value.Imported) {
            return (
                <div className="imported-certificate">
                    <h2>Imported Certificate</h2>
                    <p>You cannot make changes to imported certificates.</p>
                    <Button onClick={this.props.onCancelImport}>Cancel Import</Button>
                </div>
            );
        }

        return (
            <div>
                <DateRangeEdit defaultValue={this.state.value.Validity} onChange={this.onChangeDateRange} key={this.keys[0]} />
                <NameEdit defaultValue={this.state.value.Subject} onChange={this.onChangeSubject} key={this.keys[1]} />
                <AlternateNamesEdit defaultValue={this.state.value.AlternateNames} onChange={this.onChangeAlternateNames} key={this.keys[2]} />
                <KeyUsageEdit defaultValue={this.state.value.Usage} onChange={this.onChangeKeyUsage} key={this.keys[3]} />
            </div>
        );
    }
}
