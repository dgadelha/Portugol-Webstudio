import { BreakpointObserver } from "@angular/cdk/layout";
import { inject, Service, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";

/**
 * Tamanhos e tipo de tela, como signals compartilhados. O valor inicial já é o
 * da tela atual (`isMatched`), e ler um signal no template não dispara o
 * NG0100, ao contrário de assinar o `BreakpointObserver` durante a renderização.
 */
@Service()
export class ResponsiveService {
  private observer = inject(BreakpointObserver);

  /**
   * Celulares em pé (até 575px).
   */
  readonly isBelowSm = this.query("(max-width: 575px)");

  /**
   * Celulares e tablets em pé (até 767px).
   */
  readonly isBelowMd = this.query("(max-width: 767px)");

  /**
   * Telas de toque, em que o teclado virtual não manda teclas legíveis ao Monaco.
   */
  readonly coarsePointer = this.query("(pointer: coarse)");

  private query(media: string): Signal<boolean> {
    return toSignal(this.observer.observe(media).pipe(map(state => state.matches)), {
      initialValue: this.observer.isMatched(media),
    });
  }
}
