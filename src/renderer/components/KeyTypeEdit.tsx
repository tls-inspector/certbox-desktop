import * as React from 'react';
import { KeyType as EKeyType, SignatureAlgorithm as ESignatureAlgorithm } from '../../shared/types';
import { Icon } from './Icon';
import { Radio, RadioChoice } from './Radio';
import { Section } from './Section';

interface KeyTypeEditProps {
    defaultKeyType: EKeyType;
    defaultSignatureAlgorithm: ESignatureAlgorithm;
    onChangeKeyType: (keyType: EKeyType) => (void);
    onChangeSignatureAlgorithm: (signatureAlgorithm: ESignatureAlgorithm) => (void);
}
export const KeyTypeEdit: React.FC<KeyTypeEditProps> = (props: KeyTypeEditProps) => {
    const [KeyType, SetKeyType] = React.useState(props.defaultKeyType);
    const [SignatureAlgorithm, SetSignatureAlgorithm] = React.useState(props.defaultSignatureAlgorithm);

    React.useEffect(() => {
        props.onChangeKeyType(KeyType);
    }, [KeyType]);

    React.useEffect(() => {
        props.onChangeSignatureAlgorithm(SignatureAlgorithm);
    }, [SignatureAlgorithm]);

    const didChangeKeyType = (t: string) => {
        SetKeyType(t as EKeyType);
    };

    const didChangeSignatureAlgorithm = (t: string) => {
        SetSignatureAlgorithm(t as ESignatureAlgorithm);
    };

    const keyTypeChoices: RadioChoice[] = [
        {
            label: 'RSA (2048)',
            value: EKeyType.KeyTypeRSA_2048,
        },
        {
            label: 'RSA (4096)',
            value: EKeyType.KeyTypeRSA_4096,
        },
        {
            label: 'RSA (8192)',
            value: EKeyType.KeyTypeRSA_8192,
        },
        {
            label: 'ECDSA (P256)',
            value: EKeyType.KeyTypeECDSA_256,
        },
        {
            label: 'ECDSA (P384)',
            value: EKeyType.KeyTypeECDSA_384,
        }
    ];

    const signatureAlgorithmChoices: RadioChoice[] = [
        {
            label: 'SHA-256',
            value: ESignatureAlgorithm.SignatureAlgorithmSHA256,
        },
        {
            label: 'SHA-384',
            value: ESignatureAlgorithm.SignatureAlgorithmSHA384,
        },
        {
            label: 'SHA-512',
            value: ESignatureAlgorithm.SignatureAlgorithmSHA512,
        }
    ];

    const rsaWarning = () => {
        if (KeyType != EKeyType.KeyTypeRSA_8192) {
            return null;
        }

        return (<div className="mt-1"><Icon.Label icon={<Icon.ExclamationTriangle color='yellow'/>} label="The selected key type may take a few moments to generate." /></div>);
    };

    return (
        <Section title="Cryptography">
            <Radio label="Key Type" choices={keyTypeChoices} defaultValue={KeyType} onChange={didChangeKeyType} />
            {rsaWarning()}
            <div className="mt-2">
                <Radio label="Signature Algorithm" choices={signatureAlgorithmChoices} defaultValue={SignatureAlgorithm} onChange={didChangeSignatureAlgorithm} />
            </div>
        </Section>
    );
};
