import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReactNode } from "react";

export const MainDialog = ({
  children,
  title,
  open,
  setOpenModal,
  customMaxWidth,
}: {
  children: ReactNode;
  title: string;
  open: boolean;
  /** Radix `onOpenChange`: recibe el nuevo estado (true/false). */
  setOpenModal: (open: boolean) => void;
  customMaxWidth?: string;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpenModal}>
      {/* Usamos `onOpenChange` para controlar el cambio de estado */}
      <DialogContent customMaxWidth={customMaxWidth || "sm:max-w-[480px]"}>
        <DialogHeader>
          <DialogTitle className="md:text-xl font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
      {/* Botón para abrir el modal (ahora lo manejamos externamente) */}
      {/* Ya no necesitamos un Trigger explícito si ya gestionamos el estado en el componente */}
    </Dialog>
  );
};
