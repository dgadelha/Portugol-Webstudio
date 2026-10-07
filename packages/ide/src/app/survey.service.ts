import { inject, NgZone, Service } from "@angular/core";
import { CreateHotToastRef, HotToastService } from "@ngxpert/hot-toast";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { LocalStorageService } from "ngx-webstorage";

import { SURVEY } from "./survey";
import { SurveyInviteIconComponent } from "./survey-invite/survey-invite-icon.component";
import { SurveyInviteComponent, SurveyInviteData } from "./survey-invite/survey-invite.component";

/**
 * O que o navegador lembra da pesquisa: se já foi respondida e quantas vezes (e quando) o
 * convite apareceu.
 */
interface SurveyState {
  answered?: boolean;
  shown?: number;
  lastShownAt?: number;
}

/**
 * Espera depois de o IDE abrir, para o convite não disputar a atenção com a página carregando.
 */
const INVITE_DELAY_MS = 2500;

/**
 * Sem resposta, o convite volta depois deste tempo, até a pesquisa acabar (`SURVEY.until`).
 */
const INVITE_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000;

@Service()
export class SurveyService {
  private storage = inject(LocalStorageService);
  private toast = inject(HotToastService);
  private gaService = inject(GoogleAnalyticsService);
  private zone = inject(NgZone);

  private inviteToast?: CreateHotToastRef<unknown>;

  readonly url = SURVEY.url;

  /**
   * Com o endereço do formulário e dentro do prazo.
   */
  readonly active = this.url !== "" && Date.now() <= new Date(`${SURVEY.until}T23:59:59`).getTime();

  /**
   * Convida para a pesquisa quando o IDE abre na aba Inicial. Quem abre direto numa aba de
   * código está no meio de alguma coisa: o convite espera a próxima abertura.
   */
  inviteOnStart(isStartTabActive: () => boolean) {
    if (!this.active || !this.shouldInvite(this.state())) {
      return;
    }

    // Fora da zona: o timer não deve atrasar o registro do service worker, que espera a
    // aplicação ficar estável.
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.zone.run(() => {
          // Lido de novo: a pessoa pode ter respondido pelo Sobre durante a espera.
          const state = this.state();

          if (!isStartTabActive() || !this.shouldInvite(state)) {
            return;
          }

          const shown = (state.shown ?? 0) + 1;

          this.save({ ...state, shown, lastShownAt: Date.now() });
          // O valor é a vez em que o convite aparece para esta pessoa (1, 2, 3…)
          this.gaService.event("survey_invite_shown", "Pesquisa", SURVEY.id, shown);

          this.inviteToast = this.toast.show<SurveyInviteData>(SurveyInviteComponent, {
            data: {
              url: this.url,
              answer: () => {
                this.markAnswered("toast");
              },
              dismiss: () => {
                this.gaService.event("survey_invite_dismiss", "Pesquisa", SURVEY.id);
                this.inviteToast?.close();
              },
            },
            icon: SurveyInviteIconComponent,
            autoClose: false,
            dismissible: true,
          });

          // O X do próprio aviso: "Agora não" e responder fecham pelo código e já são contados
          this.inviteToast.afterClosed.subscribe(({ dismissedByAction }) => {
            if (dismissedByAction) {
              this.gaService.event("survey_invite_close", "Pesquisa", SURVEY.id);
            }
          });
        });
      }, INVITE_DELAY_MS);
    });
  }

  /**
   * Quem abriu o formulário não é mais convidado, mesmo sem ter terminado de responder.
   */
  markAnswered(medium: "toast" | "about") {
    this.save({ ...this.state(), answered: true });
    this.gaService.event("survey_answer", "Pesquisa", `${SURVEY.id} (${medium})`);
    this.inviteToast?.close();
  }

  private shouldInvite({ answered, lastShownAt = 0 }: SurveyState) {
    return !answered && Date.now() - lastShownAt >= INVITE_INTERVAL_MS;
  }

  private state(): SurveyState {
    return (this.storage.retrieve(`survey:${SURVEY.id}`) as SurveyState | null) ?? {};
  }

  private save(state: SurveyState) {
    this.storage.store(`survey:${SURVEY.id}`, state);
  }
}
