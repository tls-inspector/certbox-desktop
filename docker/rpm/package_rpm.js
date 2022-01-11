const os = require('os');
const installer = require('electron-installer-redhat');

const arch_long = os.arch() === 'arm64' ? 'arm64' : 'x86_64';
const arch_short = os.arch() === 'arm64' ? 'aarch64' : 'x64';

const options = {
    src: '/build_root/package/Certificate Factory-linux-' + arch_short + '/',
    dest: '/build_root/package/artifacts/',
    arch: arch_long,
    icon: '/build_root/package/Certificate Factory-linux-' + arch_short + '/resources/app/dist/assets/img/certificate-factory.png'
}

async function main (options) {
    console.log('Building .rpm package...', options);

    try {
        await installer(options)
        console.log('Finished')
    } catch (err) {
        console.error(err, err.stack)
        process.exit(1)
    }
}
main(options)