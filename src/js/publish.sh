#!/bin/sh

rm -Rf dist/
./node_modules/.bin/webpack --mode production

cp -rf package.json ../../README.md ../../LICENSE dist/
echo "{\"main\": \"index.js\"}" >> dist/ragemp/cef/package.json
echo "{\"main\": \"index.js\"}" >> dist/ragemp/client/package.json
echo "{\"main\": \"index.js\"}" >> dist/ragemp/server/package.json

mkdir -p dist/lib

mv -f lib/*.d.ts dist/lib/
mv -f ragemp/cef/index.d.ts dist/ragemp/cef/
mv -f ragemp/client/index.d.ts dist/ragemp/client/
mv -f ragemp/server/index.d.ts dist/ragemp/server/

cd dist/

npm publish --access public
