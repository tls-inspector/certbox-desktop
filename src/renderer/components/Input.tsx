import * as React from 'react';
import '../../../css/Input.scss';
import { Rand } from '../services/Rand';

interface InputProps {
    label: string;
    type?: string;
    defaultValue?: string;
    onChange?: (value: string) => (void);
    disabled?: boolean;
    required?: boolean;
    autofocus?: boolean;
}

export class Input extends React.Component<InputProps, unknown> {
    render(): JSX.Element {
        const id = Rand.ID();

        return (
            <div className="input">
                <label htmlFor={id}>
                    <span>{ this.props.label }</span>
                    <TextInput id={id} defaultValue={this.props.defaultValue} type={this.props.type} onChange={this.props.onChange} disabled={this.props.disabled} required={this.props.required} autofocus={this.props.autofocus}/>
                </label>
            </div>
        );
    }
}

interface TextInputProps {
    defaultValue?: string;
    id: string;
    type?: string;
    onChange?: (value: string) => (void);
    disabled?: boolean;
    required?: boolean;
    autofocus?: boolean;
}

interface TextInputState {
    touched: boolean;
    value: string;
}

export class TextInput extends React.Component<TextInputProps, TextInputState> {
    constructor(props: TextInputProps) {
        super(props);
        this.state = {
            value: props.defaultValue || '',
            touched: false,
        };
    }

    private onFocus = () => {
        this.setState({ touched: true });
    }

    private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        this.setState({
            value: value
        }, () => {
            this.props.onChange(this.state.value);
        });
    }

    render(): JSX.Element {
        return (
            <input id={this.props.id} name={this.props.id} className="input" type={this.props.type || 'text'} onFocus={this.onFocus} onChange={this.onChange} defaultValue={this.props.defaultValue} required={this.props.required} disabled={this.props.disabled} autoFocus={this.props.autofocus}/>
        );
    }
}
