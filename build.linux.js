const packager = require('./build.package.js');
const { spawn } = require('child_process');

async function exec(file, args, options) {
    return new Promise(resolve => {
        const tar = spawn(file, args, options);
        tar.on('close', () => {
            resolve();
        });
    });
}

(async function main() {
    await packager.app('linux', 'x64');
    await exec('tar', ['-czf', 'Certificate-Factory_linux_x64.tar.gz', 'Certificate Factory-linux-x64'], { cwd: 'package/' })
    await exec('mkdir', ['package/artifacts'])
    await exec('mv', ['package/Certificate-Factory_linux_x64.tar.gz', 'package/artifacts'])
})();
