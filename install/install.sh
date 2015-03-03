#!/bin/bash

CN=$(npm list -g --depth=0 common-node | grep common-node | cut -d "@" -f 2)

if [ $CN > 0 ];
then
    echo "CN is installed";
    common-node install-mongo.js
else
echo "Can't continue common-node is not installed";
    exit 0
fi;