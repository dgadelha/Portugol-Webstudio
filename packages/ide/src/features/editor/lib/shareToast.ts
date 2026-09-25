import { toast } from "sonner";

/**
 * Link gerado: mostra o endereço, avisa da validade e oferece copiar.
 */
export function showShareToast(url: string) {
  toast.success("Link de compartilhamento gerado", {
    description: `${url} — expira em 15 dias.`,
    duration: 30_000,
    action: {
      label: "Copiar",
      onClick: () => {
        void navigator.clipboard.writeText(url).then(() => {
          toast.success("Link copiado!");
        });
      },
    },
  });
}
