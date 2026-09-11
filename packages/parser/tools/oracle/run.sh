#!/bin/bash
#
# Oracle: roda o analisador do Portugol Studio e imprime os diagnósticos no formato
# TIPO|LINHA|COLUNA|CODIGO|MENSAGEM. O analisador é o subprojeto `analisador`
# (br.univali.portugol.Analisador) do Portugol Studio e chega pronto no portugol.tar do
# release, versionado junto do núcleo que ele espelha; aqui só há o invólucro.
#
# Uso:
#   ./run.sh arquivo.por [outro.por ...]   analisa os arquivos indicados
#   ./run.sh                               analisa o programa lido do stdin
#   ./run.sh --bibliotecas                 despeja os metadados das bibliotecas em JSON
#   ./run.sh --golden [destino]            regera a fixture (destino `-` imprime no stdout)
#
# Requer os JARs do Portugol Studio em packages/runner/tests/assets (gitignored):
# npm run test:setup -w @portugol-webstudio/runner
#
set -euo pipefail

ORACULO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARSER_DIR="$(cd "$ORACULO_DIR/../.." && pwd)"
RAIZ="$(cd "$PARSER_DIR/../.." && pwd)"

# PORTUGOL_ASSETS_DIR permite apontar para outra instalação do Portugol Studio.
ASSETS_DIR="${PORTUGOL_ASSETS_DIR:-$RAIZ/packages/runner/tests/assets}"
LIB_DIR="$ASSETS_DIR/lib"
EXEMPLOS_DIR="$RAIZ/packages/resources/assets/exemplos"
GOLDEN="$PARSER_DIR/tests/fixtures/portugol-studio.golden.txt"

if ! command -v java > /dev/null 2>&1; then
  echo "erro: 'java' precisa estar no PATH." >&2
  exit 1
fi

if [ ! -d "$LIB_DIR" ] || [ -z "$(ls -A "$LIB_DIR"/*.jar 2> /dev/null)" ]; then
  echo "erro: os JARs do Portugol Studio não foram encontrados em:" >&2
  echo "  $LIB_DIR" >&2
  echo "" >&2
  echo "Esse diretório é gitignored. Para baixá-lo, rode na raiz do repositório:" >&2
  echo "  npm run test:setup -w @portugol-webstudio/runner" >&2
  exit 1
fi

ANALISADOR_JAR="$(ls "$ASSETS_DIR"/portugol-analisador-*.jar 2> /dev/null | grep -v -- '-sources\.jar$' | head -1 || true)"

if [ -z "$ANALISADOR_JAR" ]; then
  echo "erro: portugol-analisador-*.jar não encontrado em:" >&2
  echo "  $ASSETS_DIR" >&2
  echo "" >&2
  echo "O analisador é publicado junto do console pelo Portugol Studio. Se o release" >&2
  echo "baixado ainda não o inclui, atualize a versão em packages/runner/tests/setup.sh" >&2
  echo "ou gere o jar localmente:" >&2
  echo "  cd ../Portugol-Studio && ./gradlew :portugol-analisador:build" >&2
  exit 1
fi

CLASSPATH="$(ls "$LIB_DIR"/*.jar | tr '\n' ':')$ANALISADOR_JAR"

executar() {
  java -Dfile.encoding=UTF-8 -cp "$CLASSPATH" br.univali.portugol.Analisador "$@"
}

case "${1:-}" in
  --bibliotecas)
    executar --bibliotecas
    ;;

  --golden)
    # Resolvido antes do `cd`, para um destino relativo valer a partir de onde se chamou.
    DESTINO="${2:-$GOLDEN}"

    if [ "$DESTINO" != "-" ] && [ "${DESTINO#/}" = "$DESTINO" ]; then
      DESTINO="$PWD/$DESTINO"
    fi

    # Caminhos relativos e em ordem estável, para a fixture não depender da máquina que a
    # gerou.
    cd "$EXEMPLOS_DIR"
    EXEMPLOS=()
    while IFS= read -r exemplo; do
      EXEMPLOS+=("$exemplo")
    done < <(find . -name "*.por" | sed "s|^\./||" | LC_ALL=C sort)

    if [ ${#EXEMPLOS[@]} -eq 0 ]; then
      echo "erro: nenhum exemplo .por encontrado em $EXEMPLOS_DIR" >&2
      exit 1
    fi

    if [ "$DESTINO" = "-" ]; then
      executar "${EXEMPLOS[@]}"
    else
      echo "gerando $DESTINO a partir de ${#EXEMPLOS[@]} exemplos..." >&2
      executar "${EXEMPLOS[@]}" > "$DESTINO"
      echo "ok" >&2
    fi
    ;;

  "")
    executar - | grep -v "^### " || true
    ;;

  *)
    executar "$@"
    ;;
esac
