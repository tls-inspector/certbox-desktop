const packager = require('./build.package.js');

async function build(arch) {
    await packager.app('linux', arch);
    await packager.exec('tar', ['-czf', 'Certificate-Factory_linux_' + arch + '.tar.gz', 'Certificate Factory-linux-' + arch], { cwd: 'package/' });
    await packager.exec('mkdir', ['package/artifacts']);
    await packager.exec('mv', ['package/Certificate-Factory_linux_' + arch + '.tar.gz', 'package/artifacts']);
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
