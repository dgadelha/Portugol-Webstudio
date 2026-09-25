import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { Tab } from "../types";

interface ConfirmCloseTabDialogProps {
  tab: Tab | null;
  onConfirm: (tab: Tab) => void;
  onCancel: () => void;
}

export function ConfirmCloseTabDialog({ tab, onConfirm, onCancel }: ConfirmCloseTabDialogProps) {
  return (
    <AlertDialog
      open={tab !== null}
      onOpenChange={open => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Fechar “{tab?.title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            O código que não foi baixado será perdido. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Manter aberto</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              if (tab) onConfirm(tab);
            }}
          >
            Fechar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
