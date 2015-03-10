#!/bin/sh

appdir=$(dirname $(pwd))

cd $appdir
npm install

cd $appdir/node_modules/\@dyflexis/client-info/node_modules/
npm install
cd $appdir/node_modules/\@dyflexis/parse-request/node_modules/
npm install
cd $appdir/node_modules/\@dyflexis/spdy-server/node_modules/
npm install
cd $appdir/node_modules/\@dyflexis/serve/node_modules/
npm install
cd $appdir/node_modules/\@dyflexis/session/node_modules/
npm install

cd $appdir/admin/public
bower install

cd $appdir/admin/webroot
bower install

