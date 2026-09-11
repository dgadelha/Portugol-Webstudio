#!/bin/sh
set -e

# Baixa os dois programas de referência do Portugol Studio, que vêm no mesmo arquivo
# (https://github.com/portugol-webstudio/Portugol-Studio): o portugol-console, com cuja
# saída a suíte deste pacote compara a do nosso runtime, e o portugol-analisador, usado
# pelo oracle do packages/parser (tools/oracle/run.sh).
#
# Para atualizar a referência, mude estas duas linhas: a versão dos jars vem no tar.
RELEASE="2026-09-07"
ARQUIVO="portugol.tar"

DIR=$(dirname "$0")
MARCA="$DIR/assets/.release"

# O `-sources.jar` vem no mesmo tar e ordena *antes* do jar real (`-` < `.`), então sem o
# filtro qualquer busca por nome acha só o de fontes.
existe_jar() {
  ls "$DIR"/assets/portugol-"$1"-*.jar 2> /dev/null | grep -qv -- '-sources\.jar$'
}

# O marcador diz de qual release os assets vieram. Sem ele, um checkout com os JARs de um
# release anterior — ou de quando o tar só trazia o console — ficaria na versão velha para
# sempre, porque o nome dos JARs casa com o curinga de qualquer jeito.
atualizado() {
  [ -f "$MARCA" ] && [ "$(cat "$MARCA")" = "$RELEASE" ] && existe_jar console && [ -d "$DIR/assets/lib" ]
}

if atualizado; then
  echo "Portugol Studio JARs from $RELEASE already exist in assets. Skipping download."
  exit 0
fi

echo "Downloading Portugol Studio JARs..."

mkdir -p "$DIR/assets"

# Uma falha de rede não deve impedir a suíte de rodar: sem o JAR os testes apenas deixam
# de comparar com o Portugol Studio.
if ! curl -fL -o "$DIR/assets/$ARQUIVO" "https://github.com/portugol-webstudio/Portugol-Studio/releases/download/$RELEASE/$ARQUIVO"; then
  echo "Could not download the Portugol Studio JARs. Tests will run without comparing to Portugol Studio." >&2
  rm -f "$DIR/assets/$ARQUIVO"
  exit 0
fi

# Sai o do release anterior: os JARs são versionados no nome, então conviveriam.
rm -rf "$DIR"/assets/portugol-*.jar "$DIR/assets/lib" "$MARCA"

tar -xf "$DIR/assets/$ARQUIVO" -C "$DIR/assets"
rm "$DIR/assets/$ARQUIVO"

if ! existe_jar console; then
  echo "Portugol Console JAR not found after extracting $ARQUIVO" >&2
  exit 1
fi

if ! existe_jar analisador; then
  echo "Warning: portugol-analisador-*.jar was not included in this release. The parser oracle will not work." >&2
fi

echo "$RELEASE" > "$MARCA"
