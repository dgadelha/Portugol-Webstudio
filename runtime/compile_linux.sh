#!/bin/sh
if [ -e "/lib/libc.musl-x86_64.so.1" ]; then
    RUNTIME_ID="linux-musl-x64"
else
    RUNTIME_ID="linux-x64"
fi

dotnet publish -c Release -r $RUNTIME_ID
rm -rf dist
mv ./bin/Release/netcoreapp2.2/$RUNTIME_ID/publish ./dist
mkdir ./dist/temp/
