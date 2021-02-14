const windowsInstaller = require('electron-winstaller');
const packager = require('./build.package.js');

(async function main() {
    await packager.app('win32', 'x64').then(() => {
        return windowsInstaller.createWindowsInstaller({
            appDirectory: 'package/Certificate Factory-win32-x64',
            outputDirectory: 'package/artifacts',
            title: 'Certificate Factory',
            iconUrl: 'https://raw.githubusercontent.com/tls-inspector/certificate-factory/develop/icons/certificate-factory.ico',
            setupIcon: 'icons/certificate-factory.ico',
            exe: 'certificate-factory.exe',
            setupExe: 'CertificateFactory_Windows.exe',
        }, function(err) {
            console.error(err);
        }).catch(function(err) {
            console.error(err);
        });
    }, function(err) {
        console.error(err);
    }).catch(function(err) {
        console.error(err);
    });
})();
