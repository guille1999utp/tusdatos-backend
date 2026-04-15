import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import type { ReactNode } from "react"

export const MainDialog = ({
    children,
    title,
    open,
    setOpenModal,
}: {
    children: ReactNode
    title: string
    open: boolean
    /** Radix `onOpenChange`: recibe el nuevo estado (true/false). */
    setOpenModal: (open: boolean) => void
}) => {
    return (
        <Dialog open={open} onOpenChange={setOpenModal}>  {/* Usamos `onOpenChange` para controlar el cambio de estado */}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}

                {/* Si deseas incluir un botón para cerrar el modal dentro de los contenidos */}
                <Button variant="outline" onClick={() => setOpenModal(false)}>
                    Cerrar
                </Button>
            </DialogContent>

            {/* Botón para abrir el modal (ahora lo manejamos externamente) */}
            {/* Ya no necesitamos un Trigger explícito si ya gestionamos el estado en el componente */}
        </Dialog>
    )
}
