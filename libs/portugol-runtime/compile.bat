@echo off
dotnet restore
dotnet publish -r win-x64
rm -rf bin\Debug\netcoreapp2.0\win-x64\publish\
dotnet publish -r debian.8-x64
rm -rf bin\Debug\netcoreapp2.0\debian.8-x64\publish\
mkdir dist
mv bin\Debug\netcoreapp2.0\win-x64\ .\dist\win-x64\
mv bin\Debug\netcoreapp2.0\debian.8-x64\ .\dist\debian.8-x64\