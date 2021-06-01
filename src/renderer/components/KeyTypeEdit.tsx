import * as React from 'react';
import { KeyType } from '../../shared/types';
import { Radio, RadioChoice } from './Radio';
import { Section } from './Section';

interface KeyTypeEditProps {
    defaultValue: KeyType;
    onChange: (keyType: KeyType) => (void);
}
export const KeyTypeEdit: React.FC<KeyTypeEditProps> = (props: KeyTypeEditProps) => {
    const [Value, setValue] = React.useState(props.defaultValue);

    React.useEffect(() => {
        props.onChange(Value);
    }, [Value]);

    const didChangeType = (t: string) => {
        switch (t) {
            case 'rsa':
                setValue(KeyType.RSA);
                break;
            case 'ecdsa':
                setValue(KeyType.ECDSA);
                break;
        }
    };

    const choices: RadioChoice[] = [
        {
            label: 'RSA (8192)',
            value: 'rsa',
        },
        {
            label: 'ECDSA (P384)',
            value: 'ecdsa',
        }
    ];

    return (
        <Section title="Key Type">
            <Radio label="Type" choices={choices} defaultValue={Value} onChange={didChangeType} />
        </Section>
    );
};
