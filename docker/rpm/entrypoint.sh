#!/bin/sh
set -e
set -x

cd /build_root
npm init -y
npm i --save electron-installer-redhat
node package_rpm.js