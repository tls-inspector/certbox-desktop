import * as React from 'react';
import { AlternateName, AlternateNameType } from '../../shared/types';
import { Button } from './Button';
import { Input } from './Input';
import { Radio } from './Radio';
import { Section } from './Section';
import '../../../css/AlternateName.scss';

interface AlternateNamesEditProps {
    defaultValue: AlternateName[];
    onChange: (names: AlternateName[]) => (void);
}

interface AlternateNamesEditState {
    value: AlternateName[];
}

export class AlternateNamesEdit extends React.Component<AlternateNamesEditProps, AlternateNamesEditState> {
    constructor(props: AlternateNamesEditProps) {
        super(props);
        this.state = {
            value: props.defaultValue,
        };
    }

    private changeNameAtIdx = (idx: number) => {
        return (name: AlternateName) => {
            this.setState(state => {
                const names = state.value;
                names[idx] = name;
                return { value: names };
            }, () => { this.props.onChange(this.state.value); });
        };
    }

    private addButtonClick = () => {
        this.setState(state => {
            const names = state.value;
            names.push({
                Type: AlternateNameType.DNS,
                Value: '',
            });
            return { value: names };
        }, () => { this.props.onChange(this.state.value); });
    }

    private removeButtonClick = () => {
        this.setState(state => {
            const names = state.value;
            names.splice(names.length-1, 1);
            return { value: names };
        }, () => { this.props.onChange(this.state.value); });
    }

    private removeButtonEnabled = () => {
        return this.state.value.length > 0;
    }

    render(): JSX.Element {
        return (
            <Section title="Alternate Names">
                {
                    this.state.value.map((name, idx) => {
                        return (<AlternateNameEdit key={idx} defaultValue={name} onChange={this.changeNameAtIdx(idx)} />);
                    })
                }
                <Button small onClick={this.addButtonClick}>+</Button>
                <Button small onClick={this.removeButtonClick} disabled={!this.removeButtonEnabled()}>-</Button>
            </Section>
        );
    }
}

interface AlternateNameEditProps {
    defaultValue: AlternateName;
    onChange: (names: AlternateName) => (void);
}

interface AlternateNameEditState {
    value: AlternateName;
}

class AlternateNameEdit extends React.Component<AlternateNameEditProps, AlternateNameEditState> {
    constructor(props: AlternateNameEditProps) {
        super(props);
        this.state = {
            value: props.defaultValue,
        };
    }

    private changeType = (Type: string) => {
        this.setState(state => {
            const name = state.value;
            name.Type = Type as AlternateNameType;
            return { value: name };
        }, () => { this.props.onChange(this.state.value); });
    }

    private changeValue = (Value: string) => {
        this.setState(state => {
            const name = state.value;
            name.Value = Value;
            return { value: name };
        }, () => { this.props.onChange(this.state.value); });
    }

    render(): JSX.Element {
        const typeChoices = [
            {
                value: AlternateNameType.DNS,
                label: "DNS"
            },
            {
                value: AlternateNameType.Email,
                label: "Email"
            },
            {
                value: AlternateNameType.IP,
                label: "IP"
            },
            {
                value: AlternateNameType.URI,
                label: "URI"
            }
        ];

        return (
            <div>
                <Radio label="Type" choices={typeChoices} defaultValue={this.props.defaultValue.Type} onChange={this.changeType} />
                <Input label="Value" defaultValue={this.props.defaultValue.Value} onChange={this.changeValue} required />
            </div>
        );
    }
}

