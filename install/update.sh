#!/bin/sh

appdir=$(dirname $(pwd))

cd $appdir
npm install

cd $appdir/node_modules/@dyflexis/client-info
npm install
cd $appdir/node_modules/@dyflexis/parse-request
npm install
cd $appdir/node_modules/@dyflexis/spdy-server
npm install
cd $appdir/node_modules/@dyflexis/serve
npm install
cd $appdir/node_modules/@dyflexis/session
npm install

cd $appdir/admin/public
bower install --allow-root

cd $appdir/admin/webroot
bower install --allow-root

