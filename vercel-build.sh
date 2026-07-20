#!/bin/bash
set -e

echo "Cleaning old node_modules..."
rm -rf /vercel/path0/node_modules
rm -rf /vercel/path0/client/node_modules
rm -rf /vercel/path0/server/node_modules

echo "Installing root dependencies..."
npm install --legacy-peer-deps

echo "Installing client dependencies..."
cd client
npm install --legacy-peer-deps

echo "Building client..."
npm run build
