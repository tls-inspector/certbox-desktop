import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
    faPlusCircle,
    faFileExport,
} from '@fortawesome/free-solid-svg-icons';

export namespace Icon {
    export interface IconProps {
        pulse?: boolean;
        spin?: boolean;
    }

    interface EIconProps {
        icon: IconProp;
        options: IconProps;
    }

    class EIcon extends React.Component<EIconProps, {}> {
        render(): JSX.Element {
            return ( <FontAwesomeIcon icon={this.props.icon} pulse={this.props.options.pulse} spin={this.props.options.spin}/> );
        }
    }

    export class PlusCircle extends React.Component<IconProps, {}> {render(): JSX.Element { return ( <EIcon icon={faPlusCircle} options={this.props}/> );}}
    export class FileExport extends React.Component<IconProps, {}> {render(): JSX.Element { return ( <EIcon icon={faFileExport} options={this.props}/> );}}

    export interface LabelProps { icon: JSX.Element; spin?: boolean; label: string|number; }
    export class Label extends React.Component<LabelProps, {}> {
        render(): JSX.Element {
            return (
                <span>
                    { this.props.icon }
                    <span className="ml-1">{ this.props.label }</span>
                </span>
            );
        }
    }
}
