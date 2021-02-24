import * as React from 'react';
import { Name } from '../../shared/types';
import { Input } from './Input';
import { Section } from './Section';

interface NameEditProps {
    defaultValue: Name;
    onChange: (request: Name) => (void);
}

interface NameEditState {
    value: Name;
}

export class NameEdit extends React.Component<NameEditProps, NameEditState> {
    constructor(props: NameEditProps) {
        super(props);
        this.state = {
            value: props.defaultValue
        };
    }

    private onChangeOrganization = (Organization: string) => {
        this.setState(state => {
            const name = state.value;
            name.Organization = Organization;
            return { value: name };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeCity = (City: string) => {
        this.setState(state => {
            const name = state.value;
            name.City = City;
            return { value: name };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeProvince = (Province: string) => {
        this.setState(state => {
            const name = state.value;
            name.Province = Province;
            return { value: name };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeCountry = (Country: string) => {
        this.setState(state => {
            const name = state.value;
            name.Country = Country;
            return { value: name };
        }, () => { this.props.onChange(this.state.value); });
    }

    private onChangeCommonName = (CommonName: string) => {
        this.setState(state => {
            const name = state.value;
            name.CommonName = CommonName;
            return { value: name };
        }, () => { this.props.onChange(this.state.value); });
    }


    render(): JSX.Element {
        return (
            <Section title="Subject Name">
                <Input label="Organization" defaultValue={this.state.value.Organization} onChange={this.onChangeOrganization} required />
                <Input label="City" defaultValue={this.state.value.City} onChange={this.onChangeCity} required />
                <Input label="Province" defaultValue={this.state.value.Province} onChange={this.onChangeProvince} required />
                <Input label="Country" defaultValue={this.state.value.Country} onChange={this.onChangeCountry} required />
                <Input label="Common Name" defaultValue={this.state.value.CommonName} onChange={this.onChangeCommonName} required />
            </Section>
        );
    }
}
