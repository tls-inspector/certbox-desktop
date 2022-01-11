#!/bin/sh
set -e

VERSION=${1:?Version Required}

cd deb
./build.sh
cd ../
cd rpm
./build.sh
cd ../

ARCH=$(uname -m)
mv "deb/Certificate Factory_${VERSION}_${ARCH}.deb" "../package/artifacts/Certificate Factory_linux_${VERSION}_${ARCH}.deb"
mv "rpm/Certificate Factory-${VERSION}-1.${ARCH}.rpm" "../package/artifacts/Certificate Factory_linux_${VERSION}_${ARCH}.rpm"
