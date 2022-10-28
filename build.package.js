const { copyFileSync } = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function exec(file, args, options) {
    return new Promise((resolve, reject) => {
        if (!options) {
            options = {};
        }
        options.stdio = 'inherit';
        const ps = spawn(file, args, options);
        console.log('$ ' + file + ' ' + args.join(' '));
        ps.on('error', err => {
            reject(err);
        });
        ps.on('close', () => {
            resolve();
        });
    });
}

function copyFile(src, dst) {
    console.log('Copy file', {
        source: src,
        destination: dst
    });
    copyFileSync(src, dst);
}

function packageApp(platform, arch) {
    let packager = require('electron-packager');
    return packager({
        dir: '.',
        appCopyright: 'Copyright © Ian Spence 2021',
        arch: arch,
        icon: 'icons/certificate-factory',
        name: 'Certificate Factory',
        out: 'package',
        overwrite: true,
        platform: platform,
        appBundleId: 'com.tlsinspector.certificate-factory',
        appCategoryType: 'public.app-category.utility',
        osxSign: false,
        darwinDarkModeSupport: true,
        executableName: 'certificate-factory',
        afterCopy: [
            (buildPath, electronVersion, platform, arch, callback) => {
                copyFile(path.resolve('dist', 'index.html'), path.join(buildPath, 'dist', 'index.html'));

                // Certgen needs .exe extension on Windows
                const certgenExt = platform === 'win32' ? '.exe' : '';
                copyFile(path.resolve('certgen', 'certgen_' + platform + '_' + arch + certgenExt), path.join(buildPath, 'certgen' + certgenExt));
                callback();
            }
        ],
        ignore: [
            /\.es.*/,
            /\.git.*/,
            /LICENSE/,
            /css/,
            /html/,
            /icons/,
            /node_modules/,
            /src/,
            /certgen/,
            /add_module.js/,
            /build.[a-z]+.js/,
            /package-lock.json/,
            /README.md/,
            /start_webpack.js/,
            /run.js/,
            /tsconfig.json/,
            /webpack.[a-z]+.js/,
            /.*map/,
        ]
    });
}

exports.app = packageApp;
exports.exec = exec;
