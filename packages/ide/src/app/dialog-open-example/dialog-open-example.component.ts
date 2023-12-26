import { NestedTreeControl } from "@angular/cdk/tree";
import { HttpClient } from "@angular/common/http";
import { AfterViewInit, OnDestroy, OnInit, Component, EventEmitter, Output } from "@angular/core";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { Subscription, retry } from "rxjs";

import { ResponsiveService } from "../responsive.service";

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

@Component({
  selector: "app-dialog-open-example",
  templateUrl: "./dialog-open-example.component.html",
  styleUrls: ["./dialog-open-example.component.scss"],
})
export class DialogOpenExampleComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() exampleOpened = new EventEmitter<{ title: string; code: string }>();

  treeControl: NestedTreeControl<ExampleItem>;
  dataSource: MatTreeNestedDataSource<ExampleItem>;
  current: ExampleItem | null = null;
  loading = true;

  private _loadSubscription$?: Subscription;
  private _responsive$?: Subscription;
  private _data$?: Subscription;

  isBelowMd = false;

  rawExampleCode = "";
  rawExampleCodeId = "";
  exampleCode = "";
  editor?: monaco.editor.IStandaloneCodeEditor;

  editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: "portugol",
    lineNumbers: "off",
    readOnly: true,
    minimap: { enabled: false },
    language: "portugol",
  };

  constructor(
    private http: HttpClient,
    private responsive: ResponsiveService,
  ) {
    this.treeControl = new NestedTreeControl<ExampleItem>(node => node.children);
    this.dataSource = new MatTreeNestedDataSource();
  }

  ngOnInit() {
    this._data$ = this.http
      .get<ExampleItem[]>("assets/recursos/exemplos/index.json")
      .pipe(retry())
      .subscribe(data => {
        this.loading = false;
        this.dataSource.data = data;
      });
  }

  ngOnDestroy() {
    this._responsive$?.unsubscribe();
    this._data$?.unsubscribe();
  }

  ngAfterViewInit() {
    this._responsive$ = this.responsive.isBelowMd().subscribe(isBelowMd => {
      this.isBelowMd = isBelowMd.matches;
    });
  }

  hasChildren(_: number, item: ExampleItem) {
    return item.children?.length ?? 0;
  }

  loadItem(item: ExampleItem) {
    this._loadSubscription$?.unsubscribe();
    this.current = item;
    this.exampleCode = "// Carregando…";
    this.rawExampleCode = "";
    this.rawExampleCodeId = "";

    this._loadSubscription$ = this.http
      .get(`assets/recursos/exemplos/${item.file}`, { responseType: "text" })
      .subscribe(code => {
        if (this.current?.id === item.id) {
          this.rawExampleCode = code;
          this.rawExampleCodeId = item.id;
          const commentEndPos = code.indexOf("*/");

          this.exampleCode = code.substr(commentEndPos === -1 ? 0 : code.indexOf("*/") + 2).trim();
        }
      });
  }

  openExample(item: ExampleItem) {
    if (this.rawExampleCode && this.rawExampleCodeId === item.id) {
      this.exampleOpened.emit({ title: item.name, code: this.rawExampleCode });
      return;
    }

    this.loading = true;
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
