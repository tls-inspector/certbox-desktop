export interface Options {
    CheckForUpdates: boolean;
}

export const GetDefaultOptions = (): Options => {
    return {
        CheckForUpdates: true
    };
};
