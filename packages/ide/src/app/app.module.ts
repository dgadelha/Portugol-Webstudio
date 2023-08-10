import { HttpClientModule } from "@angular/common/http";
import { APP_INITIALIZER, ErrorHandler, NgModule } from "@angular/core";
import { provideFirebaseApp, initializeApp } from "@angular/fire/app";
import { getStorage, provideStorage } from "@angular/fire/storage";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTreeModule } from "@angular/material/tree";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MonacoEditorModule } from "@materia-ui/ngx-monaco-editor";
import * as Sentry from "@sentry/angular-ivy";
import { AngularSplitModule } from "angular-split";
import { AngularSvgIconModule } from "angular-svg-icon";
import { KeyboardShortcutsModule } from "ng-keyboard-shortcuts";
import { NgxGoogleAnalyticsModule } from "ngx-google-analytics";

import { AppComponent } from "./app.component";
import { DialogOpenExampleComponent } from "./dialog-open-example/dialog-open-example.component";
import { MonacoService } from "./monaco.service";
import { TabEditorComponent } from "./tab-editor/tab-editor.component";
import { TabHelpComponent } from "./tab-help/tab-help.component";
import { TabStartComponent } from "./tab-start/tab-start.component";
import { environment } from "../environments/environment";

@NgModule({
  declarations: [AppComponent, TabEditorComponent, TabStartComponent, TabHelpComponent, DialogOpenExampleComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AngularSplitModule,
    HttpClientModule,
    MonacoEditorModule,
    KeyboardShortcutsModule.forRoot(),
    NgxGoogleAnalyticsModule.forRoot("G-ZKM28VG4G5"),
    AngularSvgIconModule.forRoot(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideStorage(() => getStorage()),
    MatSnackBarModule,
    MatRippleModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTreeModule,
  ],
  providers: [
    MonacoService,
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: true,
        dialogOptions: {
          lang: "pt-br",
        },
      }),
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      multi: true,
      deps: [MonacoService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
