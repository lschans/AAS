#!/bin/bash

CN=$(npm list -g --depth=0 common-node | grep common-node | cut -d "@" -f 2)

if [ $CN > 0 ];
then
    common-node install-mongo.js
else
echo "Installing common-node.";
    exit 0
fi;