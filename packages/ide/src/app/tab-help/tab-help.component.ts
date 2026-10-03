import { NestedTreeControl } from "@angular/cdk/tree";
import { HttpClient } from "@angular/common/http";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  output,
  viewChild,
} from "@angular/core";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { Subscription } from "rxjs";

import { ResponsiveService } from "../responsive.service";
import { Theme, ThemeService } from "../theme.service";
import { libsTree } from "./bibliotecas";
import { AjudaTopico, TreeItem } from "./types";

const AJUDA_BASE = "assets/recursos/ajuda/";

/**
 * Resolve um caminho relativo a partir do arquivo de um tópico (ambos relativos à raiz da Ajuda)
 */
function resolverCaminho(arquivo: string, relativo: string) {
  return decodeURIComponent(new URL(relativo, `https://ajuda/${arquivo}`).pathname.slice(1));
}

function ehUrlAbsoluta(url: string) {
  return /^[a-z][\d+.a-z-]*:/i.test(url) || url.startsWith("/");
}

@Component({
  selector: "app-tab-help",
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: "./tab-help.component.html",
  styleUrl: "./tab-help.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    "(click)": "onContentClick($event)",
  },
})
export class TabHelpComponent implements OnInit, OnDestroy, AfterViewInit {
  private http = inject(HttpClient);
  private ngZone = inject(NgZone);
  private gaService = inject(GoogleAnalyticsService);
  private responsive = inject(ResponsiveService);
  private themeService = inject(ThemeService);

  #responsive$?: Subscription;
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
  #idDiagrama = 0;
  #filaDiagramas = Promise.resolve();

  readonly conteudo = viewChild<string, ElementRef<HTMLElement>>("conteudo", { read: ElementRef });

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  treeControl = new NestedTreeControl<TreeItem>(node => node.children);
  dataSource = new MatTreeNestedDataSource<TreeItem>();
  current?: TreeItem;
  markdown?: string;
  theme: Theme = "dark";

  isBelowMd = false;

  readonly newTab = output<{ name: string; contents: string }>();

  ngOnInit() {
    this.http.get<AjudaTopico[]>(`${AJUDA_BASE}topicos.json`).subscribe({
      next: topicos => {
        const ajudaWithLibs = topicos.map(topico => this.#criarItem(topico)).concat(libsTree);

        this.dataSource.data = ajudaWithLibs;
        this.treeControl.expand(ajudaWithLibs[0]);
        this.treeControl.expand(ajudaWithLibs[1]);
        this.loadItem(ajudaWithLibs[0]);
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

  ngAfterViewInit() {
    this.#responsive$ = this.responsive.isBelowMd().subscribe(isBelowMd => {
      this.isBelowMd = isBelowMd.matches;
    });
  }

  ngOnDestroy() {
    this.#responsive$?.unsubscribe();
    this.#theme$?.unsubscribe();
    this.#conteudo$?.unsubscribe();
  }

  hasChildren(_: number, item: TreeItem) {
    return item.children?.length ?? 0;
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
    const link = (event.target as HTMLElement).closest("a");

    if (!link || !this.conteudo()?.nativeElement.contains(link)) {
      return;
    }

    const href = link.getAttribute("href");

    if (!href || ehUrlAbsoluta(href) || href.startsWith("#") || !this.current?.arquivo) {
      return;
    }

    const destino = this.#topicos.get(resolverCaminho(this.current.arquivo, href.split("#", 1)[0]));

    if (destino) {
      event.preventDefault();

      for (let pai = this.#pais.get(destino); pai; pai = this.#pais.get(pai)) {
        this.treeControl.expand(pai);
      }

      this.loadItem(destino);
    }
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
        if (ehUrlAbsoluta(src)) {
          return match;
        }

        let caminho = resolverCaminho(arquivo, src);

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

    if (typeof monaco !== "undefined") {
      monaco.editor.setTheme(`portugol-${this.theme}`);
      void monaco.editor.colorize(codigo, "portugol", { tabSize: 4 }).then(html => {
        // HTML gerado pelo Monaco a partir do texto do código
        // eslint-disable-next-line unicorn/no-unsafe-dom-html
        elementoCodigo.innerHTML = html;
      });
    }

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
    // Mermaid (inclusive durante a renderização, como o `fastdom`) tentariam se registrar nele
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
}
