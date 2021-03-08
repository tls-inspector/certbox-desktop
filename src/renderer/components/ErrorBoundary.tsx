import * as React from 'react';
import { IPC } from '../services/IPC';

interface ErrorBoundaryState {
    didCatch?: boolean;
}
export class ErrorBoundary extends React.Component<unknown, ErrorBoundaryState> {
    constructor(props: unknown) {
        super(props);
        this.state = {};
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        console.error(error);
        return { didCatch: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        IPC.fatalError(error, errorInfo);
    }

    render(): JSX.Element {
        if (this.state.didCatch) {
            return (<h1>A fatal error ocurred</h1>);
        }

        return (
            <React.Fragment>
                { this.props.children }
            </React.Fragment>
        );
    }
}
