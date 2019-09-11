#!/bin/sh

cd ./ragemp/cef
npm run build

cd ../client
npm run build

cd ../server
npm run build
