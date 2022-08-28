import { GetDefaultOptions, Options } from '../../shared/options';

export class OptionsManager {
    private static readonly OptionsKey = 'CertificateFactory_Options';

    public static Read(): Options {
        const value = window.localStorage.getItem(OptionsManager.OptionsKey);
        if (!value) {
            const defaultOptions = GetDefaultOptions();
            OptionsManager.Write(defaultOptions);
            return defaultOptions;
        }

        return JSON.parse(value) as Options;
    }

    public static Write(options: Options): void {
        window.localStorage.setItem(OptionsManager.OptionsKey, JSON.stringify(options));
    }
}
