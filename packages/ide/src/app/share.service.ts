import { inject, Service } from "@angular/core";
import { getBlob, ref, Storage, uploadString } from "@angular/fire/storage";

/**
 * O resultado de compartilhar ou de abrir um código compartilhado. Na falha, o motivo é o
 * código do erro do Firebase Storage sem o prefixo (como `object-not-found` ou
 * `retry-limit-exceeded`), `offline` sem internet, ou `desconhecido`: vai para o Analytics,
 * e nunca leva o código nem o identificador do link.
 */
export type ShareResult = { ok: true; value: string } | { ok: false; reason: string };

@Service()
export class ShareService {
  storage = inject(Storage);

  async share(code: string): Promise<ShareResult> {
    const shareId = this.newId();

    return this.upload(`share/${shareId}.por`, code, "text/plain", `https://portugol.dev/#share=${shareId}`);
  }

  load(shareId: string): Promise<ShareResult> {
    return this.download(`share/${shareId}.por`);
  }

  /**
   * Compartilha um exercício (o JSON publicado, sem a solução) com o id que ele tem dentro
   * (`newId`): o link abre o exercício para quem o recebe. Diferente do código, o link vale por
   * um semestre.
   */
  shareExercise(shareId: string, json: string): Promise<ShareResult> {
    return this.upload(
      `exercises/${shareId}.json`,
      json,
      "application/json",
      `https://portugol.dev/#exercise=${shareId}`,
    );
  }

  loadExercise(shareId: string): Promise<ShareResult> {
    return this.download(`exercises/${shareId}.json`);
  }

  /**
   * Grava um arquivo no Storage; no sucesso, o valor é o link (`url`).
   */
  private async upload(path: string, text: string, contentType: string, url: string): Promise<ShareResult> {
    // Sem internet, nem tenta: o Firebase só desistiria depois de várias tentativas.
    if (!navigator.onLine) {
      return { ok: false, reason: "offline" };
    }

    try {
      await uploadString(ref(this.storage, path), text, undefined, { contentType });

      return { ok: true, value: url };
    } catch (error) {
      console.error(error);
      return { ok: false, reason: this.reason(error) };
    }
  }

  /**
   * Lê um arquivo do Storage; no sucesso, o valor é o conteúdo dele.
   */
  private async download(path: string): Promise<ShareResult> {
    if (!navigator.onLine) {
      return { ok: false, reason: "offline" };
    }

    try {
      const data = await getBlob(ref(this.storage, path));

      return { ok: true, value: await data.text() };
    } catch (error) {
      console.error(error);
      return { ok: false, reason: this.reason(error) };
    }
  }

  /**
   * Sete caracteres de 0-9 e a-z, como nos links de código.
   */
  newId() {
    return (Math.random() + 1).toString(36).slice(2, 9);
  }

  private reason(error: unknown) {
    if (!navigator.onLine) {
      return "offline";
    }

    const code = (error as { code?: unknown } | null)?.code;

    return typeof code === "string" ? code.replace(/^storage\//, "") : "desconhecido";
  }
}
