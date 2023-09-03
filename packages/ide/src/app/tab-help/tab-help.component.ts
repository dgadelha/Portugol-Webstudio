import { NestedTreeControl } from "@angular/cdk/tree";
import { HttpClient } from "@angular/common/http";
import { AfterViewInit, OnDestroy, OnInit, Component, EventEmitter, NgZone, Output } from "@angular/core";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { Subscription } from "rxjs";

import { ResponsiveService } from "../responsive.service";

type PortugolWindow = Window & {
  portugol: { abrirExemplo(contents: string, name: string): void };
};

interface TreeItem {
  id: string;
  text: string;
  href: string;
  children?: TreeItem[];
}

@Component({
  selector: "app-tab-help",
  templateUrl: "./tab-help.component.html",
  styleUrls: ["./tab-help.component.scss"],
})
export class TabHelpComponent implements OnInit, OnDestroy, AfterViewInit {
  treeControl: NestedTreeControl<TreeItem>;
  dataSource: MatTreeNestedDataSource<TreeItem>;
  current?: TreeItem;
  currentUrl?: SafeResourceUrl;
  responsive$?: Subscription;
  isBelowMd = false;

  @Output() newTab = new EventEmitter();

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
    private gaService: GoogleAnalyticsService,
    private responsive: ResponsiveService,
  ) {
    this.treeControl = new NestedTreeControl<TreeItem>(node => node.children);
    this.dataSource = new MatTreeNestedDataSource();
  }

  ngOnInit() {
    (window as unknown as PortugolWindow).portugol = {
      abrirExemplo: (contents: string, name: string) => {
        this.ngZone.run(() => {
          this.newTab.emit({
            name,
            contents,
          });
        });
      },
    };

    this.http.get<TreeItem[]>("assets/recursos/ajuda/scripts/topicos.json").subscribe(
      ajuda => {
        this.dataSource.data = ajuda;
        this.treeControl.expand(ajuda[0]);
        this.loadItem(ajuda[0]);
      },
      () => {
        // TODO: tratar erro
      },
    );
  }

  ngOnDestroy() {
    this.responsive$?.unsubscribe();
  }

  ngAfterViewInit() {
    this.responsive$ = this.responsive.isBelowMd().subscribe(isBelowMd => {
      this.isBelowMd = isBelowMd.matches;
    });
  }

  hasChildren(_: number, item: TreeItem) {
    return item.children?.length ?? 0;
  }

  loadItem(item: TreeItem) {
    this.gaService.event("help_navigation", "Ajuda", item.href);
    this.current = item;
    this.currentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`assets/recursos/ajuda/${item.href}`);
  }
}
