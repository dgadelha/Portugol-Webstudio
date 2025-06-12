import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogClose, MatDialogContent } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { AngularSvgIconModule } from "angular-svg-icon";
import { NgxGoogleAnalyticsModule } from "ngx-google-analytics";

@Component({
  selector: "app-dialog-about",
  imports: [
    AngularSvgIconModule,
    MatButtonModule,
    MatDialogClose,
    MatDialogContent,
    MatIconModule,
    NgxGoogleAnalyticsModule,
  ],
  standalone: true,
  templateUrl: "./dialog-about.component.html",
  styleUrl: "./dialog-about.component.scss",
})
export class DialogAboutComponent {}
