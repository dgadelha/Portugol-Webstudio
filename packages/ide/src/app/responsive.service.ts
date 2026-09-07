import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";
import { inject, Service } from "@angular/core";
import { Observable } from "rxjs";

/**
 * @ref https://stackoverflow.com/a/68947419
 */
@Service()
export class ResponsiveService {
  private observer = inject(BreakpointObserver);

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
