#!/bin/sh
set -e

DIR=$(dirname "$0")
JAR="$DIR/assets/portugol-console-2.7.5.jar"

if [ -f "$JAR" ]; then
  echo "Portugol Console JAR already exists in assets. Skipping download."
  exit 0
fi

echo "Downloading Portugol Console JAR..."

mkdir -p "$DIR/assets"

# Uma falha de rede não deve impedir a suíte de rodar: sem o JAR os testes
# apenas deixam de comparar com o Portugol Studio
if ! curl -fL -o "$DIR/assets/console.tar" "https://github.com/portugol-webstudio/Portugol-Studio/releases/download/2026-04-24/console.tar"; then
  echo "Could not download the Portugol Console JAR. Tests will run without comparing to Portugol Studio." >&2
  rm -f "$DIR/assets/console.tar"
  exit 0
fi

tar -xf "$DIR/assets/console.tar" -C "$DIR/assets"
rm "$DIR/assets/console.tar"

if [ ! -f "$JAR" ]; then
  echo "Portugol Console JAR not found after extraction: $JAR" >&2
  exit 1
fi
