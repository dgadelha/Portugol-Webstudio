#!/usr/bin/env bash
## Remove os ícones que não são usados no projeto, para diminuir o download realizado pelo Service Worker

pushd "$(dirname ${BASH_SOURCE:0})" || exit 1
trap popd EXIT
shopt -s globstar nullglob

BASE_DIR="node_modules/@mdi/svg/svg/"

if [ ! -d "$BASE_DIR" ]; then
  echo "Error: $BASE_DIR does not exist"
  exit 1
fi

for i in "$BASE_DIR"/*.svg; do
  ICON_NAME=$(basename "$i")

  # Check if any file inside src/ uses the icon
  if grep -q "$ICON_NAME" src/**/*.ts src/**/*.html src/**/*.scss; then
    echo "skipped $ICON_NAME"
    continue
  fi

  rm "$i"
done
