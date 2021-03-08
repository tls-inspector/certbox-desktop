import * as React from 'react';
import { IPC } from '../services/IPC';

interface LinkProps {
    url: string;
    children?: React.ReactNode;
}
export const Link: React.FC<LinkProps> = (props: LinkProps) => {
    const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        IPC.openInBrowser(props.url);
    };

    return (
        <a href="#" onClick={onClick}>{ props.children }</a>
    );
};
