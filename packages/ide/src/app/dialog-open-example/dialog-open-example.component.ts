import { HttpClient } from "@angular/common/http";
import {
  afterNextRender,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { map, retry, Subscription } from "rxjs";

import { ResponsiveService } from "../responsive.service";
import { ThemeService } from "../theme.service";
import { converterExemplos, Exemplo } from "./exemplos";

export interface ExampleItem {
  id: string;
  name: string;
  type: string;
  file?: string;
  description?: string;
  hasImage?: boolean;
  image?: string;
  dir?: string;
  children?: ExampleItem[];
}

/**
 * Um exemplo com a sua categoria (a pasta de primeiro nível) e as subpastas, para agrupar e buscar.
 */
interface ExampleEntry {
  item: ExampleItem;
  category: string;
  path: string[];
  searchText: string;
}

interface ExampleGroup {
  category: string;
  entries: ExampleEntry[];
}

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function flattenExamples(items: ExampleItem[], parents: string[] = []): ExampleEntry[] {
  return items.flatMap(item => {
    if (item.children?.length) {
      return flattenExamples(item.children, [...parents, item.name]);
    }

    if (!item.file) {
      return [];
    }

    return [
      {
        item,
        category: parents[0] ?? "Exemplos",
        path: parents.slice(1),
        searchText: normalize([item.name, ...parents, item.description ?? ""].join(" ")),
      },
    ];
  });
}

@Component({
  selector: "app-dialog-open-example",
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: "./dialog-open-example.component.html",
  styleUrl: "./dialog-open-example.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class DialogOpenExampleComponent implements OnInit, OnDestroy, AfterViewInit {
  private http = inject(HttpClient);
  private responsive = inject(ResponsiveService);
  private themeService = inject(ThemeService);
  private injector = inject(Injector);

  private _loadSubscription$?: Subscription;
  private _responsive$?: Subscription;
  private _data$?: Subscription;
  private _theme$?: Subscription;

  readonly exampleOpened = output<{ title: string; code: string }>();
  private readonly description = viewChild<ElementRef<HTMLParagraphElement>>("description");

  // A descrição mostra só duas linhas; "Leia mais" aparece quando o texto não cabe nelas
  private descriptionObserver = new ResizeObserver(() => {
    this.measureDescription();
  });
  // Signal: é atualizado depois da renderização (no ResizeObserver e no afterNextRender),
  // e uma propriedade comum alterada nesse momento quebraria a verificação de mudanças
  readonly descriptionClamped = signal(false);
  descriptionExpanded = false;

  entries: ExampleEntry[] = [];
  filtered: ExampleEntry[] = [];
  groups: ExampleGroup[] = [];
  query = "";
  current: ExampleItem | null = null;
  loading = true;

  isBelowMd = false;

  rawExampleCode = "";
  rawExampleCodeId = "";
  exampleCode = "";
  editor?: monaco.editor.IStandaloneCodeEditor;

  editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: "portugol-dark",
    lineNumbers: "off",
    readOnly: true,
    minimap: { enabled: false },
    language: "portugol",
    fontSize: 13,
  };

  constructor() {
    effect(() => {
      const element = this.description()?.nativeElement;

      this.descriptionObserver.disconnect();

      if (element) {
        this.descriptionObserver.observe(element);
      }
    });
  }

  ngOnInit() {
    this._data$ = this.http
      .get<Exemplo[]>("assets/recursos/exemplos/index.json")
      .pipe(
        retry(),
        map(exemplos => converterExemplos(exemplos)),
      )
      .subscribe(data => {
        this.loading = false;
        this.entries = flattenExamples(data);
        this.search("");

        if (!this.isBelowMd && this.filtered[0]) {
          this.loadItem(this.filtered[0].item);
        }
      });

    this._theme$ = this.themeService.theme$.subscribe(theme => {
      this.editorOptions = { ...this.editorOptions, theme: `portugol-${theme}` };
    });
  }

  ngAfterViewInit() {
    this._responsive$ = this.responsive.isBelowMd().subscribe(isBelowMd => {
      this.isBelowMd = isBelowMd.matches;
    });
  }

  ngOnDestroy() {
    this._responsive$?.unsubscribe();
    this._data$?.unsubscribe();
    this._theme$?.unsubscribe();
    this._loadSubscription$?.unsubscribe();
    this.descriptionObserver.disconnect();
  }

  toggleDescription() {
    this.descriptionExpanded = !this.descriptionExpanded;
  }

  private measureDescription() {
    // Expandida, a descrição não transborda, mas o botão precisa continuar lá para recolhê-la
    if (this.descriptionExpanded) {
      return;
    }

    const element = this.description()?.nativeElement;
    const clamped = !!element && element.scrollHeight > element.clientHeight;

    this.descriptionClamped.set(clamped);
  }

  search(query: string) {
    this.query = query;

    const terms = normalize(query).split(/\s+/).filter(Boolean);

    this.filtered = this.entries.filter(entry => terms.every(term => entry.searchText.includes(term)));
    this.groups = [];

    for (const entry of this.filtered) {
      const group = this.groups.find(g => g.category === entry.category);

      if (group) {
        group.entries.push(entry);
      } else {
        this.groups.push({ category: entry.category, entries: [entry] });
      }
    }

    // Mantém a prévia no primeiro resultado quando o exemplo aberto some da busca
    if (!this.isBelowMd && this.filtered[0] && this.filtered.every(entry => entry.item.id !== this.current?.id)) {
      this.loadItem(this.filtered[0].item);
    }
  }

  onSearchKeydown(event: KeyboardEvent) {
    const index = this.filtered.findIndex(entry => entry.item.id === this.current?.id);

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();

        const next = this.filtered.at(
          event.key === "ArrowDown" ? Math.min(index + 1, this.filtered.length - 1) : Math.max(index - 1, 0),
        );

        if (next && next.item.id !== this.current?.id) {
          this.loadItem(next.item);
          document.querySelector(`#${CSS.escape(`example-${next.item.id}`)}`)?.scrollIntoView({ block: "nearest" });
        }

        break;
      }

      case "Enter": {
        if (index !== -1 && this.current) {
          event.preventDefault();
          this.openExample(this.current);
        }

        break;
      }
    }
  }

  onItemClick(item: ExampleItem) {
    // Em telas pequenas não há prévia, então o clique já abre o exemplo
    if (this.isBelowMd) {
      this.current = item;
      this.openExample(item);
    } else {
      this.loadItem(item);
    }
  }

  loadItem(item: ExampleItem) {
    this._loadSubscription$?.unsubscribe();
    this.current = item;
    this.descriptionExpanded = false;
    this.exampleCode = "// Carregando…";
    this.rawExampleCode = "";
    this.rawExampleCodeId = "";

    afterNextRender(
      () => {
        this.measureDescription();
      },
      { injector: this.injector },
    );

    this._loadSubscription$ = this.http
      .get(`assets/recursos/exemplos/${item.file}`, { responseType: "text" })
      .subscribe(code => {
        if (this.current?.id === item.id) {
          this.rawExampleCode = code;
          this.rawExampleCodeId = item.id;
          const commentEndPos = code.indexOf("*/");

          this.exampleCode = code.slice(commentEndPos === -1 ? 0 : code.indexOf("*/") + 2).trim();
        }
      });
  }

  openExample(item: ExampleItem) {
    if (this.rawExampleCode && this.rawExampleCodeId === item.id) {
      this.exampleOpened.emit({ title: item.name, code: this.rawExampleCode });
      return;
    }

    this._loadSubscription$?.unsubscribe();

    this._loadSubscription$ = this.http
      .get(`assets/recursos/exemplos/${item.file}`, { responseType: "text" })
      .subscribe(code => {
        if (this.current?.id === item.id) {
          this.exampleOpened.emit({ title: item.name, code });
        }
      });
  }
}
