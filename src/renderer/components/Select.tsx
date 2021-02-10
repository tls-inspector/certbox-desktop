import * as React from 'react';
import '../../../css/Input.scss';
import { Rand } from '../services/Rand';

interface SelectChoice {
    label: string;
    value: string;
}

export interface SelectProps {
    label: string;
    choices: SelectChoice[];
    defaultValue?: string;
    onChange?: (value: string) => (void);
    disabled?: boolean;
    required?: boolean;
}

interface SelectState {
    touched: boolean;
    value: string;
}

export class Select extends React.Component<SelectProps, SelectState> {
    constructor(props: SelectProps) {
        super(props);
        this.state = {
            value: props.defaultValue || '',
            touched: false,
        };
    }

    private onFocus = () => {
        this.setState({ touched: true });
    }

    private onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        this.setState({
            value: value
        }, () => {
            this.props.onChange(this.state.value);
        });
    }

    private defaultChoice = () => {
        let hasEmptyChoice = false;
        this.props.choices.forEach(choice => {
            if (choice.value === '') {
                hasEmptyChoice = true;
            }
        });
        if (hasEmptyChoice) {
            return null;
        }

        return (<option value="" disabled>Select One</option>);
    }

    render(): JSX.Element {
        const id = Rand.ID();

        return (
            <div className="input">
                <label htmlFor={id}>
                    <span>{ this.props.label }</span>

                    <select className="select" id={id} name={id} onFocus={this.onFocus} onChange={this.onChange} defaultValue={this.props.defaultValue} disabled={this.props.disabled} required={this.props.required}>
                        {
                            this.defaultChoice()
                        }
                        {
                            this.props.choices.map((choice, idx) => {
                                return (<option value={choice.value} key={idx}>{choice.label}</option>);
                            })
                        }
                    </select>
                </label>
            </div>
        );
    }
}
