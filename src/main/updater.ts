import https = require('https');
import * as manifest from '../../package.json';

interface GithubAsset {
    url: string;
    id: number;
    node_id: string;
    name: string;
    content_type: string;
    state: string;
    size: number;
    download_count: number;
    created_at: string;
    updated_at: string;
    browser_download_url: string;
}

interface GithubRelease {
    url: string;
    assets_url: string;
    upload_url: string;
    html_url: string;
    id: number;
    node_id: string;
    tag_name: string;
    target_commitish: string;
    name: string;
    draft: boolean;
    prerelease: boolean;
    created_at: string;
    published_at: string;
    assets: GithubAsset[];
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
