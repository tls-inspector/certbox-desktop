import * as React from 'react';
import { Dialog } from './Dialog';
import { Options as OptionsType } from '../../shared/options';
import { Checkbox } from './Checkbox';
import { OptionsManager } from '../services/OptionsManager';

export const OptionsDialog: React.FC = () => {
    const [Options, SetOptions] = React.useState<OptionsType>(OptionsManager.Read());

    const buttons = [
        {
            label: 'Save',
            onClick: () => {
                OptionsManager.Write(Options);
            }
        },
        {
            label: 'Cancel'
        }
    ];

    const SetCheckForUpdates = (CheckForUpdates: boolean) => {
        SetOptions(options => {
            options.CheckForUpdates = CheckForUpdates;
            return {...options};
        });
    };

    return (
        <Dialog title="Options" buttons={buttons}>
            <Checkbox defaultValue={Options.CheckForUpdates} onChange={SetCheckForUpdates} label="Check for updates" />
        </Dialog>
    );
};
