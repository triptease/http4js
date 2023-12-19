#!/usr/bin/env bash
set -x

npm run build && \
npm run test && \
rm -rf dist && \
cp -r src/main dist && \
cp package.json tsconfig.json README.md dist && \
pushd dist && \
npm config set registry https://us-npm.pkg.dev/triptease-paid-search/tt-paid-search/ && \
yarn artifactregistry-login && \
npm publish && \
popd && \
rm -r dist
