import https = require('https');
import * as manifest from '../../package.json';

interface GithubRelease {
    html_url: string;
    name: string;
}

export interface Version {
    Title: string;
    Number: number;
    ReleaseURL: string;
}

export class Updater {
    private static latestVersion: Version;

    /**
     * Is the current version of the app the latest release available
     */
    public static async GetNewerRelease(): Promise<Version> {
        const currentVersion = parseInt(manifest.version.replace(/\./g, ''));

        if (!this.latestVersion) {
            try {
                await this.getLatestRelease();
            } catch (err) {
                console.error('Error checking for updates', err);
                return undefined;
            }
        }

        if (currentVersion < this.latestVersion.Number) {
            return this.latestVersion;
        }

        return undefined;
    }

    private static async getLatestRelease(): Promise<Version> {
        const latest = await this.getRelease();
        const latestVersionNumber = parseInt(latest.name.replace(/\./g, ''));
        console.log('Update check complete', {
            'latest-version': latest.name,
            'current-version': manifest.version
        });
        Updater.latestVersion = {
            Title: latest.name,
            Number: latestVersionNumber,
            ReleaseURL: latest.html_url,
        };

        return Updater.latestVersion;
    }

    private static getRelease(): Promise<GithubRelease> {
        return new Promise((resolve, reject) => {
            const options: https.RequestOptions = {
                protocol: 'https:',
                hostname: 'api.github.com',
                port: 443,
                path: '/repos/tls-inspector/certificate-factory/releases/latest',
                method: 'GET',
                headers: {
                    'User-Agent': manifest.name + '@' + manifest.version,
                    Accept: 'application/vnd.github.v3+json',
                }
            };

            let data = '';
            https.get(options, res => {
                if (res.statusCode !== 200) {
                    reject('HTTP response ' + res.statusCode);
                    return;
                }

                res.on('data', (d: string) => {
                    data += d;
                });

                res.on('close', () => {
                    try {
                        const release = JSON.parse(data) as GithubRelease;
                        resolve(release);
                    } catch (err) {
                        reject(err);
                        return;
                    }
                });
            });
        });
    }
}
