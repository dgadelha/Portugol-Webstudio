#!/bin/bash
dotnet restore
dotnet publish -r debian.8-x64
rm -rf ./bin/Debug/netcoreapp2.0/debian.8-x64/publish
rm -rf ./dist/*/
mv ./bin/Debug/netcoreapp2.0/debian.8-x64/ ./dist/debian.8-x64/
mkdir ./dist/debian.8-x64/temp/
rm -rf ./bin/
