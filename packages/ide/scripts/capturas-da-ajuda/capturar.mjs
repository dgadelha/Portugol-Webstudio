//
// Tira as capturas de tela do guia do Portugol Webstudio, na Ajuda, nos temas claro e escuro, e
// grava em `packages/resources/ajuda/recursos/imagens/<light|dark>/webstudio/` como WebP sem
// perdas (o menor formato para capturas de tela, e a Ajuda inteira vai para o uso sem internet).
// As imagens têm o dobro dos pixels da tela, e o `@2x` no nome faz a Ajuda mostrá-las no tamanho
// de verdade, nítidas em telas de alta densidade.
//
// Precisa do servidor de desenvolvimento rodando (`npm start`, em http://localhost:4200), do
// Microsoft Edge instalado e do `cwebp` (pacote `webp`). A cena `sobre` usa o portugol.dev, porque
// o uso sem internet fica desligado no servidor local, e a `compartilhar` gera um link de verdade.
//
//   npm run capturas-da-ajuda -w @portugol-webstudio/ide              todas as cenas
//   npm run capturas-da-ajuda -w @portugol-webstudio/ide -- exemplos  só as cenas citadas
//
// Variáveis: `URL_IDE` troca o endereço do IDE, `NAVEGADOR=chrome` usa o Chrome, `ESCALA` muda a
// densidade das imagens (2 por padrão) e `DESTINO` grava as imagens em outra pasta.
//
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright-core";

const URL_IDE = process.env.URL_IDE ?? "http://localhost:4200/";
const PROGRAMAS = path.join(import.meta.dirname, "programas");
const IMAGENS = process.env.DESTINO ?? path.resolve(import.meta.dirname, "../../../resources/ajuda/recursos/imagens");
const ESCALA = Number(process.env.ESCALA ?? 2);
const TEMAS = ["light", "dark"];

// O selo da versão beta e as mensagens no canto da tela não aparecem nas capturas.
const SEM_BETA = ".beta-badge, .status-beta { display: none !important; }";
const SEM_MENSAGENS = "hot-toast-container { display: none !important; }";

const UA_CELULAR =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36";

const temporário = mkdtempSync(path.join(os.tmpdir(), "capturas-da-ajuda-"));
const navegador = await chromium.launch({ channel: process.env.NAVEGADOR ?? "msedge", headless: true });

/**
 * Uma página nova, num contexto limpo: sem abas de antes nem configurações mudadas.
 *
 * O navegador continua se apresentando como o do sistema: num Mac, o editor usa a Menlo, e com
 * outro sistema a fonte cairia na Courier. O tamanho da fonte é o padrão fora do Mac, 14px.
 *
 * @param {string} tema
 * @param {{ largura?: number; altura?: number; celular?: boolean; mensagens?: boolean; url?: string }} [opções]
 */
async function novaPágina(
  tema,
  { largura = 1200, altura = 720, celular = false, mensagens = false, url = URL_IDE } = {},
) {
  const contexto = await navegador.newContext({
    viewport: { width: largura, height: altura },
    deviceScaleFactor: ESCALA,
    colorScheme: tema === "dark" ? "dark" : "light",
    isMobile: celular,
    hasTouch: celular,
    locale: "pt-BR",
    ...(celular && { userAgent: UA_CELULAR }),
  });

  await contexto.addInitScript(() => {
    localStorage.setItem("pws:editorfontsize", "14");
  });

  const página = await contexto.newPage();

  await página.goto(url, { waitUntil: "networkidle" });
  await página.addStyleTag({ content: mensagens ? SEM_BETA : SEM_BETA + SEM_MENSAGENS });
  await página.waitForTimeout(800);

  return página;
}

/**
 * Abre um programa de `programas/` pelo próprio "Abrir arquivo" do IDE, numa aba com o nome do
 * arquivo.
 *
 * @param {import("playwright-core").Page} página
 * @param {string} arquivo
 */
async function abrir(página, arquivo) {
  await página.locator("input[type=file][multiple]").setInputFiles(path.join(PROGRAMAS, arquivo));
  await página.getByRole("tab", { name: arquivo.replace(/\.por$/, "") }).waitFor();
  await página.waitForTimeout(1500);
}

/**
 * @param {import("playwright-core").Page} página
 */
async function executar(página) {
  await página.getByRole("toolbar", { name: "Ações" }).getByRole("button", { name: "Executar", exact: true }).click();
}

/**
 * @param {import("playwright-core").Page} página
 */
async function digitarNome(página) {
  await página.getByText("Aguardando entrada").first().waitFor();
  await página.keyboard.type("Ana");
}

/**
 * A caixa de um elemento visível na tela.
 *
 * @param {import("playwright-core").Locator} elemento
 */
async function caixaDe(elemento) {
  const caixa = await elemento.boundingBox();

  if (!caixa) {
    throw new Error("O elemento não está visível");
  }

  return caixa;
}

/**
 * Grava a captura de `alvo` (a página ou um elemento) como WebP sem perdas.
 *
 * @param {import("playwright-core").Page | import("playwright-core").Locator} alvo
 * @param {string} tema
 * @param {string} nome
 * @param {import("playwright-core").PageScreenshotOptions} [opções]
 */
async function capturar(alvo, tema, nome, opções = {}) {
  const png = path.join(temporário, `${tema}-${nome}.png`);
  const destino = path.join(IMAGENS, tema, "webstudio", `${nome}@${ESCALA}x.webp`);

  await alvo.screenshot({ path: png, animations: "disabled", ...opções });
  execFileSync("cwebp", ["-quiet", "-lossless", "-z", "9", png, "-o", destino]);
  console.log(`✔ ${tema}/${nome}`);
}

/**
 * @type {Record<string, (tema: string) => Promise<void>>}
 */
const cenas = {
  async inicio(tema) {
    const página = await novaPágina(tema);
    const sobre = await caixaDe(página.getByRole("button", { name: "Sobre" }));

    await capturar(página, tema, "inicio", { clip: { x: 0, y: 0, width: 1200, height: sobre.y + sobre.height + 24 } });
  },

  async "editor-novo"(tema) {
    const página = await novaPágina(tema);

    await página.getByRole("button", { name: /Novo arquivo/ }).click();
    await página.waitForTimeout(1500);
    await capturar(página, tema, "editor-novo");
  },

  async "primeiro-programa"(tema) {
    const página = await novaPágina(tema);

    await abrir(página, "Primeiro programa.por");
    await executar(página);
    await página.getByText("Programa finalizado").waitFor();
    await página.waitForTimeout(400);
    await capturar(página, tema, "primeiro-programa");
  },

  async "barra-de-acoes"(tema) {
    // Numa janela baixa, sobra pouco espaço entre a Ajuda e as Configurações.
    const página = await novaPágina(tema, { altura: 500 });

    await abrir(página, "Primeiro programa.por");
    await capturar(página.getByRole("toolbar", { name: "Ações" }), tema, "barra-de-acoes");
  },

  async "barra-de-status"(tema) {
    const página = await novaPágina(tema);

    await abrir(página, "Com erros.por");
    await capturar(página.locator('[aria-label="Barra de status"]'), tema, "barra-de-status");
  },

  async "leia-aguardando"(tema) {
    const página = await novaPágina(tema);

    await abrir(página, "Nome e idade.por");
    await executar(página);
    await digitarNome(página);
    await página.waitForTimeout(400);
    await capturar(página, tema, "leia-aguardando");
  },

  async "leia-concluido"(tema) {
    const página = await novaPágina(tema);

    await abrir(página, "Nome e idade.por");
    await executar(página);
    await digitarNome(página);
    await página.keyboard.press("Enter");
    await página.waitForTimeout(500);
    await página.keyboard.type("2010");
    await página.keyboard.press("Enter");
    await página.getByText("Programa finalizado").waitFor();
    await página.waitForTimeout(400);
    await capturar(página, tema, "leia-concluido");
  },

  async "leia-celular"(tema) {
    const página = await novaPágina(tema, { largura: 390, altura: 760, celular: true });

    await abrir(página, "Nome e idade.por");
    await executar(página);

    const campo = página.getByRole("textbox", { name: "Entrada do programa" });

    await campo.waitFor();
    await campo.fill("Ana");
    await página.waitForTimeout(400);
    await capturar(página, tema, "leia-celular");
  },

  async "erros-no-editor"(tema) {
    const página = await novaPágina(tema);

    await abrir(página, "Com erros.por");
    await página.getByRole("tab", { name: /Problemas/ }).click();
    await página.waitForTimeout(600);
    await capturar(página, tema, "erros-no-editor");
  },

  async "executar-com-erros"(tema) {
    const página = await novaPágina(tema);

    await abrir(página, "Com erros.por");
    await executar(página);
    await página.getByText("não foi executado").waitFor();
    await página.waitForTimeout(400);
    await capturar(página, tema, "executar-com-erros");
  },

  async "salvar-como"(tema) {
    const página = await novaPágina(tema);

    await abrir(página, "Primeiro programa.por");
    await página.getByRole("button", { name: "Salvar como" }).click();

    const menu = página.getByRole("menu");

    await menu.waitFor();

    const caixa = await caixaDe(menu);

    await capturar(página, tema, "salvar-como", {
      clip: {
        x: 0,
        y: 0,
        width: Math.min(1200, caixa.x + caixa.width + 40),
        height: Math.min(720, caixa.y + caixa.height + 40),
      },
    });
  },

  async compartilhar(tema) {
    // Gera um link de verdade, que expira em 15 dias.
    const página = await novaPágina(tema, { mensagens: true });

    await abrir(página, "Primeiro programa.por");
    await página.getByRole("button", { name: "Compartilhar código" }).click();
    await página.getByText("Link gerado").waitFor({ timeout: 30_000 });
    await página.waitForTimeout(600);
    await capturar(página, tema, "compartilhar");
  },

  async renomear(tema) {
    const página = await novaPágina(tema);

    await abrir(página, "Primeiro programa.por");
    await página.getByRole("tab", { name: "Primeiro programa" }).focus();
    await página.keyboard.press("F2");
    await capturar(página.getByRole("dialog"), tema, "renomear");
  },

  async "fechar-aba"(tema) {
    const página = await novaPágina(tema);

    await abrir(página, "Primeiro programa.por");
    await página.getByRole("tab", { name: "Primeiro programa" }).focus();
    await página.keyboard.press("Delete");
    await capturar(página.getByRole("dialog"), tema, "fechar-aba");
  },

  async exemplos(tema) {
    const página = await novaPágina(tema);

    await página
      .getByRole("button", { name: /Abrir exemplo/ })
      .first()
      .click();

    const diálogo = página.getByRole("dialog");

    await diálogo.waitFor();
    await página.keyboard.type("media");
    await página.waitForTimeout(800);
    await capturar(diálogo, tema, "exemplos");
  },

  async configuracoes(tema) {
    const página = await novaPágina(tema, { altura: 800 });

    await página.getByRole("button", { name: "Configurações" }).click();

    const diálogo = página.getByRole("dialog");

    await diálogo.waitFor();

    for (const [seção, nome] of [
      ["Aparência", "configuracoes-aparencia"],
      ["Editor", "configuracoes-editor"],
      ["Saída", "configuracoes-saida"],
      ["Abas", "configuracoes-abas"],
    ]) {
      await diálogo.getByRole("button", { name: seção, exact: true }).click();
      await página.waitForTimeout(500);

      // A descrição diz o padrão do Mac, onde as capturas são tiradas; fora dele, é 14px.
      await diálogo.evaluate(elemento => {
        const textos = document.createTreeWalker(elemento, NodeFilter.SHOW_TEXT);

        for (let texto = textos.nextNode(); texto; texto = textos.nextNode()) {
          texto.textContent = (texto.textContent ?? "")
            .replace("O padrão é 12px", "O padrão é 14px")
            .replace("O editor usa 12px", "O editor usa 14px");
        }
      });

      await capturar(diálogo, tema, nome);
    }
  },

  async sobre(tema) {
    const página = await novaPágina(tema, { url: "https://portugol.dev/" });

    // O convite para a pesquisa tem data para acabar.
    await página.addStyleTag({ content: "a:has(> svg-icon[src*='clipboard']) { display: none !important; }" });
    await página.getByRole("button", { name: "Sobre" }).click();

    const diálogo = página.getByRole("dialog");

    await diálogo.waitFor();
    await diálogo.getByText("Pronto para usar sem internet").waitFor({ timeout: 120_000 });
    await página.waitForTimeout(500);
    await capturar(diálogo, tema, "sobre");
  },

  async "ajuda-exemplo"(tema) {
    const página = await novaPágina(tema, {
      url: `${URL_IDE}#ajuda=topicos/linguagem_portugol/entrada_saida/escreva.md`,
    });

    const tenteVocêMesmo = página.getByRole("button", { name: /Tente você mesmo/ }).first();

    await tenteVocêMesmo.waitFor();

    // O primeiro exemplo fica depois da sintaxe e do fluxograma: rola até ele, com o título e o
    // botão "Tente você mesmo" na tela.
    await tenteVocêMesmo.evaluate(botão => botão.closest("figure")?.scrollIntoView({ block: "center" }));

    // Abrir a Ajuda pelo endereço deixa o foco, e o contorno dele, na aba.
    await página.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
    await página.waitForTimeout(800);
    await capturar(página, tema, "ajuda-exemplo");
  },
};

const escolhidas = process.argv.slice(2);
const desconhecidas = escolhidas.filter(nome => !Object.hasOwn(cenas, nome));

if (desconhecidas.length > 0) {
  console.error(`Cenas desconhecidas: ${desconhecidas.join(", ")}. Cenas: ${Object.keys(cenas).join(", ")}`);
  process.exitCode = 1;
} else {
  let falhas = 0;

  for (const tema of TEMAS) {
    mkdirSync(path.join(IMAGENS, tema, "webstudio"), { recursive: true });

    for (const [nome, cena] of Object.entries(cenas)) {
      if (escolhidas.length > 0 && !escolhidas.includes(nome)) {
        continue;
      }

      try {
        await cena(tema);
      } catch (error) {
        falhas++;
        console.error(`✘ ${tema}/${nome}: ${String(error).split("\n", 1)[0]}`);
      }
    }
  }

  process.exitCode = falhas > 0 ? 1 : 0;
}

await navegador.close();
rmSync(temporário, { recursive: true, force: true });
