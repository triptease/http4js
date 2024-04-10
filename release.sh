#!/usr/bin/env bash
set -x

npm run build && \
npm run test && \
rm -rf dist && \
cp -r src/main dist && \
cp package.json tsconfig.json README.md dist && \
pushd dist && \
npm publish --access public && \
popd && \
rm -r dist
