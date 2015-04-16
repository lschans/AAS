#!/bin/sh

appdir=$(dirname $(pwd))

cd $appdir
npm install

cd $appdir/node_modules/@AAS/client-info
npm install
cd $appdir/node_modules/@AAS/parse-request
npm install
cd $appdir/node_modules/@AAS/spdy-server
npm install
cd $appdir/node_modules/@AAS/serve
npm install
cd $appdir/node_modules/@AAS/session
npm install

cd $appdir/admin/public
bower install --allow-root

cd $appdir/admin/webroot
bower install --allow-root

