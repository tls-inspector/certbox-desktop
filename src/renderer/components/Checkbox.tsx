import * as React from 'react';
import '../../../css/Input.scss';
import { Rand } from '../services/Rand';

export interface CheckboxProps {
    label: string;
    defaultValue?: boolean;
    onChange?: (value: boolean) => (void);
    disabled?: boolean;
}

interface CheckboxState {
    touched: boolean;
    value: boolean;
}

export class Checkbox extends React.Component<CheckboxProps, CheckboxState> {
    constructor(props: CheckboxProps) {
        super(props);
        this.state = {
            value: props.defaultValue || false,
            touched: false,
        };
    }

    private onFocus = () => {
        this.setState({ touched: true });
    }

    private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        this.setState({
            value: checked
        }, () => {
            this.props.onChange(this.state.value);
        });
    }

    render(): JSX.Element {
        const id = Rand.ID();

        return (
            <div className="input-checkbox">
                <label htmlFor={id}>
                    <input className="checkbox" id={id} name={id} type="checkbox" onFocus={this.onFocus} onChange={this.onChange} defaultChecked={this.props.defaultValue} disabled={this.props.disabled} />
                    <span>{ this.props.label }</span>
                </label>
            </div>
        );
    }
}
