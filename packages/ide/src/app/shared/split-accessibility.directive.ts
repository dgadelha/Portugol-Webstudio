import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input, NgZone } from "@angular/core";

/**
 * Corrige o que o `angular-split` diz aos leitores de tela sobre os divisores entre as áreas:
 *
 * - o `aria-orientation` é o do divisor, não o da divisão: áreas lado a lado têm um divisor
 *   vertical, e o `angular-split` diria "horizontal";
 * - o valor vira a porcentagem do espaço que a área ocupa, como "35%", em vez de "300 pixel"
 *   ou "35 percent", em inglês. Em pixels, o número diria pouco a quem não vê a tela, e
 *   mudaria com o tamanho da janela.
 *
 * O `angular-split` reescreve esses atributos a cada mudança de tamanho, e então eles são
 * corrigidos de novo. Vale para todo `<as-split>` do componente que importa a diretiva.
 */
@Directive({ selector: "as-split" })
export class SplitAccessibilityDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * A área cujo tamanho o divisor anuncia: a que o nome dele (`gutterAriaLabel`) diz, como o
   * painel, que fica depois do divisor em "Altura do painel".
   */
  readonly appGutterArea = input<"before" | "after">("before");

  constructor() {
    const host = this.element.nativeElement;

    // Fora da zona do Angular, onde o zone.js prende as funções dos observadores ao criá-los: eles
    // disparam a cada passo do arrasto, e só mexem em atributos que o Angular não acompanha
    const { mutations, resizes } = inject(NgZone).runOutsideAngular(() => ({
      mutations: new MutationObserver(records => {
        // Um divisor novo, como o do enunciado de um exercício, também passa a ser observado
        if (records.some(record => record.type === "childList")) {
          this.observeGutters(mutations);
        }

        this.scheduleUpdate();
      }),
      // O tamanho em pixels de uma área muda com a janela, e a porcentagem também
      resizes: new ResizeObserver(() => {
        this.scheduleUpdate();
      }),
    }));

    mutations.observe(host, { attributes: true, attributeFilter: ["class", "style"], childList: true });
    resizes.observe(host);

    afterNextRender(() => {
      this.observeGutters(mutations);
      this.update();
    });

    inject(DestroyRef).onDestroy(() => {
      mutations.disconnect();
      resizes.disconnect();
      cancelAnimationFrame(this.frame);
    });
  }

  private frame = 0;

  /**
   * Uma atualização por quadro: no arrasto, o `angular-split` muda o estilo do `<as-split>` e
   * os atributos dos divisores a cada passo, e cada leitura dos tamanhos força o navegador a
   * recalcular o layout.
   */
  private scheduleUpdate() {
    if (this.frame) {
      return;
    }

    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.update();
    });
  }

  /**
   * Só os atributos dos divisores: as áreas têm o código e o painel, que mudam o tempo todo.
   */
  private observeGutters(observer: MutationObserver) {
    for (const gutter of this.gutters()) {
      observer.observe(gutter, {
        attributes: true,
        attributeFilter: ["aria-orientation", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext"],
      });
    }
  }

  private gutters() {
    return [...this.element.nativeElement.children].filter(child => child.classList.contains("as-split-gutter"));
  }

  private update() {
    const host = this.element.nativeElement;
    const horizontal = host.classList.contains("as-horizontal");
    const sizes = [...host.children]
      .filter(child => child.tagName === "AS-SPLIT-AREA")
      .map(area => (horizontal ? area.getBoundingClientRect().width : area.getBoundingClientRect().height));
    const total = sizes.reduce((sum, size) => sum + size, 0);

    // Numa aba escondida, as áreas não têm tamanho: os valores ficam para quando ela aparecer
    if (total === 0) {
      return;
    }

    const offset = this.appGutterArea() === "after" ? 1 : 0;

    for (const [index, gutter] of this.gutters().entries()) {
      const percent = Math.round(((sizes[index + offset] ?? 0) / total) * 100);

      this.setAttribute(gutter, "aria-orientation", horizontal ? "vertical" : "horizontal");
      this.setAttribute(gutter, "aria-valuemin", "0");
      this.setAttribute(gutter, "aria-valuemax", "100");
      this.setAttribute(gutter, "aria-valuenow", String(percent));
      this.setAttribute(gutter, "aria-valuetext", `${percent}%`);
    }
  }

  /**
   * Só grava o que mudou: cada gravação avisa o `MutationObserver` de novo.
   */
  private setAttribute(element: Element, name: string, value: string) {
    if (element.getAttribute(name) !== value) {
      element.setAttribute(name, value);
    }
  }
}
