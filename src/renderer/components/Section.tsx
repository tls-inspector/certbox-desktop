import * as React from 'react';
import '../../../css/Section.scss';

interface SectionProps {
    title: string;
}
export class Section extends React.Component<SectionProps, unknown> {
    render(): JSX.Element {
        return (
            <div className="section">
                <span className="section-title">{ this.props.title }</span>
                <div className="section-content">
                    { this.props.children }
                </div>
            </div>
        );
    }
}
