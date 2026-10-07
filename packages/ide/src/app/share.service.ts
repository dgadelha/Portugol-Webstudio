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
    const shareId = (Math.random() + 1).toString(36).slice(2, 9);

    try {
      await uploadString(ref(this.storage, `share/${shareId}.por`), code, undefined, {
        contentType: "text/plain",
      });

      return { ok: true, value: `https://portugol.dev/#share=${shareId}` };
    } catch (error) {
      console.error(error);
      return { ok: false, reason: this.reason(error) };
    }
  }

  async load(shareId: string): Promise<ShareResult> {
    try {
      const data = await getBlob(ref(this.storage, `share/${shareId}.por`));
      const contents = await data.text();

      return { ok: true, value: contents };
    } catch (error) {
      console.error(error);
      return { ok: false, reason: this.reason(error) };
    }
  }

  private reason(error: unknown) {
    if (!navigator.onLine) {
      return "offline";
    }

    const code = (error as { code?: unknown } | null)?.code;

    return typeof code === "string" ? code.replace(/^storage\//, "") : "desconhecido";
  }
}
