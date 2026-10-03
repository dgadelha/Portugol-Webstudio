import { CdkTree, CdkTreeModule } from "@angular/cdk/tree";
import { HttpClient } from "@angular/common/http";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  Injector,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  output,
  untracked,
  viewChild,
} from "@angular/core";
import { AngularSplitModule } from "angular-split";
import { AngularSvgIconModule } from "angular-svg-icon";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { MarkdownComponent } from "ngx-markdown";
import { Subscription } from "rxjs";

import { settings } from "../../settings";
import { MonacoService } from "../monaco.service";
import { SettingsService } from "../settings.service";
import { WorkspaceService } from "../workspace.service";
import { ResponsiveService } from "../responsive.service";
import { Theme, ThemeService } from "../theme.service";
import { libsTree } from "./bibliotecas";
import { AjudaTopico, TreeItem } from "./types";

const AJUDA_BASE = "assets/recursos/ajuda/";

@Component({
  selector: "app-tab-help",
  imports: [AngularSplitModule, AngularSvgIconModule, CdkTreeModule, MarkdownComponent],
  templateUrl: "./tab-help.component.html",
  styleUrl: "./tab-help.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    "(click)": "onContentClick($event)",
  },
})
export class TabHelpComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private ngZone = inject(NgZone);
  private gaService = inject(GoogleAnalyticsService);
  private responsive = inject(ResponsiveService);
  private themeService = inject(ThemeService);
  private monacoService = inject(MonacoService);
  private settingsService = inject(SettingsService);
  private workspace = inject(WorkspaceService);
  private injector = inject(Injector);

  #theme$?: Subscription;
  #conteudo$?: Subscription;

  /**
   * Tópicos da Ajuda indexados pelo caminho do arquivo, para seguir os links entre eles
   */
  #topicos = new Map<string, TreeItem>();
  #pais = new Map<TreeItem, TreeItem>();
  #codigos = new WeakMap<Element, string>();
  #diagramas = new WeakMap<Element, string>();
  #rolarParaTopo = false;
  #topicoPendente?: string;
  #idDiagrama = 0;
  #filaDiagramas = Promise.resolve();

  readonly conteudo = viewChild<string, ElementRef<HTMLElement>>("conteudo", { read: ElementRef });

  private readonly tree = viewChild<CdkTree<TreeItem>>("tree");

  /**
   * Tópicos da Ajuda e as bibliotecas, na árvore da barra lateral (CDK Tree:
   * setas, Home/End e busca pela primeira letra vêm dela).
   */
  topicos: TreeItem[] = [];
  readonly childrenAccessor = (node: TreeItem) => node.children ?? [];
  readonly trackById = (_: number, node: TreeItem) => node.id;
  current?: TreeItem;
  markdown?: string;
  theme: Theme = "dark";

  readonly isBelowMd = this.responsive.isBelowMd;
  readonly newTab = output<{ name: string; contents: string }>();

  constructor() {
    // Um endereço `#ajuda=<arquivo>` pede um tópico pelo estado da aplicação.
    effect(() => {
      const topico = this.workspace.helpTopicRequest();

      if (topico) {
        untracked(() => {
          this.workspace.helpTopicRequest.set(null);
          this.openTopic(topico);
        });
      }
    });
  }

  ngOnInit() {
    this.http.get<AjudaTopico[]>(`${AJUDA_BASE}topicos.json`).subscribe({
      next: topicos => {
        const ajudaWithLibs = topicos.map(topico => this.#criarItem(topico)).concat(libsTree);

        this.topicos = ajudaWithLibs;
        this.loadItem(ajudaWithLibs[0]);

        // Depois que a árvore desenha os tópicos: os dois primeiros grupos
        // começam abertos, e um tópico pedido antes de carregar é aberto.
        afterNextRender(
          () => {
            this.tree()?.expand(ajudaWithLibs[0]);
            this.tree()?.expand(ajudaWithLibs[1]);

            if (this.#topicoPendente) {
              this.openTopic(this.#topicoPendente);
            }
          },
          { injector: this.injector },
        );
      },
      error: () => {
        // TODO: tratar erro
      },
    });

    this.#theme$ = this.themeService.theme$.subscribe(theme => {
      this.theme = theme;

      if (this.current?.source !== undefined) {
        this.#exibir(this.current);
      }

      void this.#renderizarDiagramas();
    });
  }

  ngOnDestroy() {
    this.#theme$?.unsubscribe();
    this.#conteudo$?.unsubscribe();
  }

  #encontrar(itens: TreeItem[], id: string | undefined): TreeItem | undefined {
    for (const item of itens) {
      if (item.id === id) {
        return item;
      }

      const filho = this.#encontrar(item.children ?? [], id);

      if (filho) {
        return filho;
      }
    }

    return undefined;
  }

  hasChildren(_: number, item: TreeItem) {
    return (item.children?.length ?? 0) > 0;
  }

  loadItem(item: TreeItem) {
    this.gaService.event("help_navigation", "Ajuda", item.arquivo ?? item.id);
    this.gaService.pageView(item.arquivo ?? item.id, item.text, item.arquivo ?? item.id);
    this.current = item;
    this.#rolarParaTopo = true;
    this.#conteudo$?.unsubscribe();

    if (item.source !== undefined) {
      this.#exibir(item);
      return;
    }

    if (item.arquivo) {
      this.#conteudo$ = this.http.get(AJUDA_BASE + item.arquivo, { responseType: "text" }).subscribe(source => {
        item.source = source;

        if (this.current === item) {
          this.#exibir(item);
        }
      });
    }
  }

  /**
   * Links entre tópicos da Ajuda abrem o tópico na própria aba
   */
  onContentClick(event: MouseEvent) {
    // Um clique na linha de um tópico da árvore abre o tópico; pelo teclado, a
    // árvore emite `activation` com Enter.
    const row = (event.target as HTMLElement).closest<HTMLElement>("[data-topico]");

    if (row) {
      const item = this.#encontrar(this.topicos, row.dataset["topico"]);

      if (item) {
        this.loadItem(item);
      }

      return;
    }

    const link = (event.target as HTMLElement).closest("a");

    if (!link || !this.conteudo()?.nativeElement.contains(link)) {
      return;
    }

    const arquivo = link.dataset["ajuda"];

    // Com Ctrl, Cmd ou Shift, o navegador abre o endereço `#ajuda=` numa aba
    // ou janela nova, e o IDE começa nesse tópico.
    if (!arquivo || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    event.preventDefault();
    this.openTopic(arquivo);
  }

  /**
   * Abre um tópico pelo caminho do arquivo (como em `#ajuda=atribuicao.md`),
   * abrindo as pastas da árvore até ele. Antes de os tópicos carregarem, o
   * pedido espera por eles.
   */
  openTopic(arquivo: string) {
    const destino = this.#topicos.get(arquivo);

    if (!destino) {
      this.#topicoPendente = arquivo;
      return;
    }

    this.#topicoPendente = undefined;

    for (let pai = this.#pais.get(destino); pai; pai = this.#pais.get(pai)) {
      this.tree()?.expand(pai);
    }

    this.loadItem(destino);
  }

  /**
   * Chamado pelo `ngx-markdown` após renderizar o conteúdo
   */
  onContentReady() {
    const conteudo = this.conteudo()?.nativeElement;

    if (!conteudo) {
      return;
    }

    if (this.#rolarParaTopo) {
      this.#rolarParaTopo = false;
      conteudo.closest("as-split-area")?.scrollTo(0, 0);
    }

    // Os links entre tópicos apontam para os arquivos Markdown, que não existem
    // como páginas: viram endereços `#ajuda=<arquivo>`, que abrem o tópico no
    // IDE, mesmo numa aba nova do navegador.
    for (const link of conteudo.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      const href = link.getAttribute("href") ?? "";

      if (!this.current?.arquivo || this.ehUrlAbsoluta(href) || href.startsWith("#")) {
        continue;
      }

      const arquivo = this.resolverCaminho(this.current.arquivo, href.split("#", 1)[0]);

      if (this.#topicos.has(arquivo)) {
        link.dataset["ajuda"] = arquivo;
        link.setAttribute("href", `#ajuda=${encodeURIComponent(arquivo)}`);
      }
    }

    // O tema do Monaco é global: aplicado uma vez para todos os exemplos.
    void this.monacoService.ready.then(() => {
      monaco.editor.setTheme(`portugol-${this.theme}`);
    });

    for (const bloco of conteudo.querySelectorAll("figure.codigo-portugol")) {
      this.#prepararCodigo(bloco);
    }

    for (const codigo of conteudo.querySelectorAll(":scope pre > code.language-mermaid")) {
      const diagrama = document.createElement("div");

      diagrama.className = "diagrama";
      this.#diagramas.set(diagrama, codigo.textContent ?? "");
      codigo.parentElement!.replaceWith(diagrama);
    }

    void this.#renderizarDiagramas();
  }

  #criarItem(topico: AjudaTopico, pai?: TreeItem): TreeItem {
    const item: TreeItem = { id: topico.arquivo, text: topico.titulo, arquivo: topico.arquivo };

    item.children = topico.subtopicos?.map(subtopico => this.#criarItem(subtopico, item));
    this.#topicos.set(topico.arquivo, item);

    if (pai) {
      this.#pais.set(item, pai);
    }

    return item;
  }

  #exibir(item: TreeItem) {
    let markdown = item.source ?? "";

    if (item.arquivo) {
      const arquivo = item.arquivo;

      // As imagens são relativas ao arquivo do tópico; as que têm variante por tema
      // ficam em `recursos/imagens/<light|dark>/`
      markdown = markdown.replaceAll(/(!\[[^\]]*]\()([^\s)]+)\)/g, (match, prefixo: string, src: string) => {
        if (this.ehUrlAbsoluta(src)) {
          return match;
        }

        let caminho = this.resolverCaminho(arquivo, src);

        if (this.theme === "dark") {
          caminho = caminho.replace("/imagens/light/", "/imagens/dark/");
        }

        return `${prefixo}${AJUDA_BASE}${caminho})`;
      });
    }

    this.markdown = markdown;
  }

  #prepararCodigo(bloco: Element) {
    const elementoCodigo = bloco.querySelector("code");

    if (!elementoCodigo || this.#codigos.has(bloco)) {
      return;
    }

    const codigo = elementoCodigo.textContent ?? "";

    this.#codigos.set(bloco, codigo);

    // Com a Ajuda aberta ao recarregar a página, o conteúdo chega antes do
    // Monaco: as cores esperam ele ficar pronto.
    void this.monacoService.ready.then(async () => {
      // HTML gerado pelo Monaco a partir do texto do código
      // eslint-disable-next-line unicorn/no-unsafe-dom-html
      elementoCodigo.innerHTML = await monaco.editor.colorize(codigo, "portugol", {
        // A mesma largura de tabulação do editor, escolhida nas configurações
        tabSize: this.settingsService.get(settings.editorTabSize),
      });
    });

    if (bloco.classList.contains("exemplo")) {
      const botao = document.createElement("button");

      botao.type = "button";
      botao.className = "tente-voce-mesmo";
      botao.textContent = "Tente você mesmo";
      botao.addEventListener("click", () => {
        this.gaService.event("help_try_example", "Ajuda", this.current?.arquivo);
        this.ngZone.run(() => {
          this.newTab.emit({ name: this.current?.text ?? "Exemplo", contents: codigo });
        });
      });

      bloco.append(botao);
    }
  }

  /**
   * Renderizações em fila: o tema e a renderização do conteúdo podem pedir ao mesmo tempo
   */
  #renderizarDiagramas() {
    this.#filaDiagramas = this.#filaDiagramas.then(() => this.#renderizarDiagramasAgora());
    return this.#filaDiagramas;
  }

  async #renderizarDiagramasAgora() {
    const diagramas = [...(this.conteudo()?.nativeElement.querySelectorAll(".diagrama") ?? [])];

    if (diagramas.length === 0) {
      return;
    }

    // O loader AMD do Monaco deixa `define` global, e os módulos UMD carregados pelo
    // Mermaid (inclusive durante a renderização, como o `fastdom`) tentariam se registrar
    // nele. Ele fica escondido enquanto o Mermaid trabalha, mas só depois de o Monaco
    // terminar de carregar: com a Ajuda aberta ao recarregar a página, os arquivos do
    // Monaco ainda estariam chegando, e sem o `define` o editor nunca carregaria.
    await this.monacoService.ready;

    const global = globalThis as { define?: unknown };
    const define = global.define;

    global.define = undefined;

    try {
      const { default: mermaid } = await import("mermaid");

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: this.theme === "dark" ? "dark" : "default",
        fontFamily: "inherit",
      });

      for (const diagrama of diagramas) {
        const codigo = this.#diagramas.get(diagrama);

        if (codigo === undefined) {
          continue;
        }

        try {
          const { svg } = await mermaid.render(`ajuda-diagrama-${++this.#idDiagrama}`, codigo);

          // SVG gerado pelo Mermaid com `securityLevel: "strict"`
          // eslint-disable-next-line unicorn/no-unsafe-dom-html
          diagrama.innerHTML = svg;
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      global.define = define;
    }
  }

  /**
   * Resolve um caminho relativo a partir do arquivo de um tópico (ambos relativos à raiz da Ajuda)
   */
  private resolverCaminho(arquivo: string, relativo: string) {
    return decodeURIComponent(new URL(relativo, `https://ajuda/${arquivo}`).pathname.slice(1));
  }

  private ehUrlAbsoluta(url: string) {
    return /^[a-z][\d+.a-z-]*:/i.test(url) || url.startsWith("/");
  }
}
