const macInstaller = require('electron-installer-dmg');
const packager = require('./build.package.js');

async function build(arch, name) {
    return packager.app('darwin', arch).then(() => {
        return macInstaller({
            appPath: 'package/Certificate Factory-darwin-x64/Certificate Factory.app',
            name: 'CertificateFactory_macOS_' + name,
            out: 'package/artifacts',
            icon: 'icons/certificate-factory.icns'
        });
    }, function(err) {
        throw err;
    }).catch(function(err) {
        throw err;
    });
}

(async function main() {
    try {
        await build('x64', 'Intel');
        await build('arm64', 'M1');
    } catch (err) {
        console.error(err);
    }
})();
