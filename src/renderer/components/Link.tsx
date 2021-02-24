import * as React from 'react';
import { IPC } from '../services/IPC';

interface LinkProps {
    url: string;
}
export class Link extends React.Component<LinkProps, unknown> {
    private onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        IPC.openInBrowser(this.props.url);
    }

    render(): JSX.Element {
        return (
            <a href="#" onClick={this.onClick}>{ this.props.children }</a>
        );
    }
}
