import * as React from 'react';
import { DateRange } from '../../shared/types';
import { Input } from './Input';
import { Section } from './Section';

interface DateRangeEditProps {
    defaultValue: DateRange;
    onChange: (request: DateRange) => (void);
}

interface DateRangeEditState {
    value: DateRange;
    notBefore: string;
    notAfter: string;
}

export class DateRangeEdit extends React.Component<DateRangeEditProps, DateRangeEditState> {
    constructor(props: DateRangeEditProps) {
        super(props);

        const notBefore = props.defaultValue.NotBefore.split('T')[0];
        const notAfter = props.defaultValue.NotAfter.split('T')[0];

        this.state = {
            value: props.defaultValue,
            notBefore: notBefore,
            notAfter: notAfter,
        };
    }

    private onChangeNotBefore = (NotBefore: string) => {
        this.setState(state => {
            const validity = state.value;
            validity.NotBefore = NotBefore + 'T00:00:00.00Z';
            return { value: validity, notBefore: NotBefore };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeNotAfter = (NotAfter: string) => {
        this.setState(state => {
            const validity = state.value;
            validity.NotAfter = NotAfter + 'T23:59:59.99Z';
            return { value: validity, notAfter: NotAfter };
        }, () => { this.props.onChange(this.state.value); });
    }

    render(): JSX.Element {
        return (
            <Section title="Date Range">
                <Input label="Not Before" type="date" defaultValue={this.state.notBefore} onChange={this.onChangeNotBefore} required />
                <Input label="Not After" type="date" defaultValue={this.state.notAfter} onChange={this.onChangeNotAfter} required />
            </Section>
        );
    }
}
