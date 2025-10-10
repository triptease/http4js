#!/usr/bin/env bash
set -x

rm -rf dist && \
npm run build && \
npm run test && \
npm config set registry https://us-npm.pkg.dev/triptease-paid-search/tt-paid-search/ && \
yarn artifactregistry-login && \
npm publish
