const packager = require('./build.package.js');

(async function main() {
    await packager.app('linux', 'x64').then(() => {}, console.error).catch(console.error);
})();