export class App {
    /**
     * Is this application running in a production configuration.
     *
     * Production configuration is used when the application has been packaged.
     * This will be false if running from the electron wrapper.
     */
    public static isProduction(): boolean {
        return process.env['DEVELOPMENT'] === undefined;
    }
}