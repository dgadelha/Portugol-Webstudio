import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

/**
 * @ref https://stackoverflow.com/a/68947419
 */
@Injectable({ providedIn: "root" })
export class ResponsiveService {
  constructor(private observer: BreakpointObserver) {}

  isBelowSm(): Observable<BreakpointState> {
    return this.observer.observe(["(max-width: 575px)"]);
  }

  isBelowMd(): Observable<BreakpointState> {
    return this.observer.observe(["(max-width: 767px)"]);
  }

  isBelowLg(): Observable<BreakpointState> {
    return this.observer.observe(["(max-width: 991px)"]);
  }

  isBelowXl(): Observable<BreakpointState> {
    return this.observer.observe(["(max-width: 1199px)"]);
  }
}
