const packager = require('./build.package.js');
const createDMG = require('electron-installer-dmg');

async function build(arch) {
    await packager.app('darwin', arch);
    await createDMG({
        appPath: 'package/Certificate Factory-darwin-' + arch + '/Certificate Factory.app',
        name: 'Certificate Factory',
        title: 'Certificate Factory',
        icon: 'icons/certificate-factory.icns',
        format: 'ULFO',
        out: 'package/artifacts'
    });
    await packager.exec('mv', ['package/artifacts/Certificate Factory.dmg', 'package/artifacts/Certificate-Factory_macOS_' + arch + '.dmg']);
}

(async function main() {
    try {
        await packager.exec('mkdir', ['-p', 'package/artifacts']);
        await build('x64');
        await build('arm64');
    } catch (err) {
        console.error(err);
    }
})();
