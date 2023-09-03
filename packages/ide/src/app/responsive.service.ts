import { BreakpointObserver } from "@angular/cdk/layout";
import type { BreakpointState } from "@angular/cdk/layout";
import { Inject, Injectable } from "@angular/core";
import type { Observable } from "rxjs";

/**
 * @ref https://stackoverflow.com/a/68947419
 */
@Injectable({ providedIn: "root" })
export class ResponsiveService {
  constructor(@Inject(BreakpointObserver) private observer: BreakpointObserver) {}

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
