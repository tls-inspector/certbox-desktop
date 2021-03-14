const packager = require('./build.package.js');

(async function main() {
    await packager.app('linux', 'x64');
    await packager.exec('tar', ['-czf', 'Certificate-Factory_linux_x64.tar.gz', 'Certificate Factory-linux-x64'], { cwd: 'package/' })
    await packager.exec('mkdir', ['package/artifacts'])
    await packager.exec('mv', ['package/Certificate-Factory_linux_x64.tar.gz', 'package/artifacts'])
})();
