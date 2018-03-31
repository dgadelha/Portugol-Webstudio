@echo off
dotnet restore
dotnet publish -r win-x64
del /s /q bin\Debug\netcoreapp2.0\win-x64\publish\*
rmdir /s /q bin\Debug\netcoreapp2.0\win-x64\publish\
dotnet publish -r debian.8-x64
del /s /q bin\Debug\netcoreapp2.0\debian.8-x64\publish\*
rmdir /s /q bin\Debug\netcoreapp2.0\debian.8-x64\publish\
mkdir dist
move bin\Debug\netcoreapp2.0\win-x64\ .\dist\win-x64\
move bin\Debug\netcoreapp2.0\debian.8-x64\ .\dist\debian.8-x64\