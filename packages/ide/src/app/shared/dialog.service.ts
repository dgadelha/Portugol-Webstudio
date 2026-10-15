import { Dialog, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { ComponentType } from "@angular/cdk/portal";
import { inject, Service } from "@angular/core";

export interface PwsDialogConfig<D> {
  data?: D;
  width?: string;
  height?: string;
  /**
   * `id` do título do diálogo: é o nome que o leitor de tela anuncia ao abrir.
   */
  ariaLabelledBy: string;
  panelClass?: string;
  disableClose?: boolean;
  /**
   * Devolve o foco a quem abriu o diálogo ao fechar (padrão). Com um seletor, o
   * foco vai para esse elemento; com `false`, quem abriu cuida do foco.
   */
  restoreFocus?: boolean | string;
  /**
   * Sem fundo escurecido, para janelas que convivem com o editor (a janela da
   * biblioteca Gráficos). O resto da página continua visível, mas não fica
   * acessível: o CDK ainda prende o Tab na janela e esconde o resto dos
   * leitores de tela (`aria-hidden`) até ela fechar, como o diálogo do Material
   * fazia antes.
   */
  modeless?: boolean;
}

/**
 * Abre os diálogos do IDE com o visual e o comportamento de sempre: fundo
 * escurecido, foco preso dentro do diálogo e devolvido ao fechar, e o título
 * como nome acessível.
 */
@Service()
export class DialogService {
  private readonly dialog = inject(Dialog);

  /**
   * Quantos diálogos com fundo escurecido estão abertos. Os avisos ficam na camada do topo do
   * navegador, acima de qualquer diálogo, e cobririam os botões dele: enquanto um está aberto,
   * eles se escondem (veja `_overlay.scss`). A janela de gráficos não conta: ela fica aberta
   * o programa inteiro, e os avisos de então (como o do arquivo salvo) sumiriam sem ser vistos.
   */
  private modalCount = 0;

  open<R, D = unknown, C = unknown>(component: ComponentType<C>, config: PwsDialogConfig<D>): DialogRef<R, C> {
    const modeless = config.modeless ?? false;

    const dialogConfig: DialogConfig<D, DialogRef<R, C>> = {
      data: config.data,
      width: config.width,
      height: config.height,
      maxWidth: "calc(100vw - 2rem)",
      // `dvh`: a altura visível. No Safari do iPhone, `vh` conta a tela sem as barras do
      // navegador, e um diálogo alto passava da área visível, sem as margens.
      maxHeight: "calc(100dvh - 2rem)",
      ariaLabelledBy: config.ariaLabelledBy,
      ariaModal: !modeless,
      hasBackdrop: !modeless,
      backdropClass: "pws-backdrop",
      panelClass: ["pws-dialog", ...(config.panelClass ? [config.panelClass] : [])],
      disableClose: config.disableClose,
      autoFocus: "first-tabbable",
      restoreFocus: config.restoreFocus ?? true,
    };

    const ref = this.dialog.open<R, D, C>(component, dialogConfig);

    if (!modeless) {
      this.modalCount++;
      document.body.classList.add("pws-dialog-open");

      ref.closed.subscribe(() => {
        this.modalCount--;
        document.body.classList.toggle("pws-dialog-open", this.modalCount > 0);
      });
    }

    return ref;
  }
}
