const packager = require('./build.package.js');

async function build(arch) {
    await packager.app('darwin', arch);
    await packager.exec('zip', ['-r', 'Certificate-Factory_macOS_' + arch + '.zip', 'Certificate Factory.app'], { cwd: 'package/Certificate Factory-darwin-' + arch});
    await packager.exec('mv', ['package/Certificate Factory-darwin-' + arch + '/Certificate-Factory_macOS_' + arch + '.zip', 'package/artifacts/Certificate-Factory_macOS_' + arch + '.zip']);
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
