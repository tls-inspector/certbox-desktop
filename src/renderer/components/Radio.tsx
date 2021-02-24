import * as React from 'react';
import '../../../css/Button.scss';
import '../../../css/Radio.scss';
import { Rand } from '../services/Rand';

export interface RadioChoice {
    label: string;
    value: string;
}

interface RadioProps {
    label: string;
    choices: RadioChoice[];
    defaultValue?: string;
    onChange: (value: string) => void;
}

interface RadioState {
    selectedIdx: number;
}

export class Radio extends React.Component<RadioProps, RadioState> {
    constructor(props: RadioProps) {
        super(props);
        this.state = {
            selectedIdx: props.choices.findIndex(c => { return c.value === props.defaultValue; }),
        };
    }

    private radioChange = (sender: React.ChangeEvent<HTMLInputElement>) => {
        const checked = sender.target.checked;
        const value = sender.target.value;
        if (checked) {
            this.props.onChange(value);
        }
    }

    render(): JSX.Element {
        const radioId = Rand.ID();
        return (
        <React.Fragment>
            <label className="radio-label">{ this.props.label }</label>
            <div className="radio-group">
                {
                    this.props.choices.map((choice, idx) => {
                        const id = Rand.ID();
                        return (<React.Fragment key={idx}>
                            <input type="radio" className="radio-check" name={radioId} id={id} value={ choice.value } defaultChecked={this.state.selectedIdx === idx} onChange={this.radioChange}/>
                            <label htmlFor={id} className="radio-button">{ choice.label }</label>
                        </React.Fragment>);
                    })
                }
            </div>
        </React.Fragment>
        );
    }
}


