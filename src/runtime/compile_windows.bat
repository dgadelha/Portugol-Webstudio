@echo off
dotnet publish -r win-x64
rmdir /s /q dist
move bin\Debug\netcoreapp3.1\win-x64\publish\ dist
mkdir dist\temp
rmdir /s /q bin
