#!/bin/sh
set -e

VERSION=${1:?Version Required}

cd deb
./build.sh
cd ../
cd rpm
./build.sh
cd ../

ARCH='x64'
if [[ $(uname -m) == "aarch64" ]]; then
    ARCH='arm64'
fi

mv "deb/certificate-factory_${VERSION}_${ARCH}.deb" "../package/artifacts/Certificate-Factory_linux_${ARCH}.deb"
mv "rpm/certificate-factory-${VERSION}-1.${ARCH}.rpm" "../package/artifacts/Certificate-Factory_linux_${ARCH}.rpm"
