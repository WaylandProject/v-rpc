#!/bin/sh

./build.sh

cd dist/

npm publish --access public
