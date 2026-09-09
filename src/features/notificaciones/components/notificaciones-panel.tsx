"use client";

import { Check } from "lucide-react";
import { toast } from "sonner";
import { EncabezadoPagina } from "@/components/common/encabezado-pagina";
import { EstadoCarga } from "@/components/common/estado-carga";
import { Insignia } from "@/components/ui/insignia";
import { TablaDatos } from "@/components/ui/tabla-datos";
import { usarNotificaciones } from "@/features/notificaciones/hooks/usar-notificaciones";
import { formatearFechaHora } from "@/lib/utilidades/formato";

export function NotificacionesPanel() {
  const notificaciones = usarNotificaciones();

  async function manejarLeida(id: string) {
    const resultado = await notificaciones.marcarLeida(id);
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }
    toast.success("Notificación marcada como leída.");
    notificaciones.refrescar();
  }

  return (
    <div className="grid gap-6">
      <EncabezadoPagina
        titulo="Notificaciones"
        descripcion="Avisos y eventos relevantes para la sesión actual."
      />
      {notificaciones.cargando ? (
        <EstadoCarga />
      ) : (
        <TablaDatos
          columnas={[
            { clave: "fecha", titulo: "Fecha", renderizar: (fila) => formatearFechaHora(fila.creado_en) },
            { clave: "titulo", titulo: "Título", renderizar: (fila) => fila.titulo },
            { clave: "mensaje", titulo: "Mensaje", renderizar: (fila) => fila.mensaje },
            {
              clave: "estado",
              titulo: "Estado",
              renderizar: (fila) => (
                <Insignia tono={fila.leida ? "exito" : "neutro"}>
                  {fila.leida ? "leída" : "pendiente"}
                </Insignia>
              )
            },
            {
              clave: "acciones",
              titulo: "Acciones",
              renderizar: (fila) =>
                fila.leida ? (
                  "Sin acciones"
                ) : (
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-borde)] hover:bg-[var(--color-panel-suave)]"
                    title="Marcar leída"
                    aria-label="Marcar leída"
                    onClick={() => manejarLeida(fila.id)}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )
            }
          ]}
          datos={notificaciones.notificaciones}
          obtenerClave={(fila) => fila.id}
          vacio="Sin notificaciones"
        />
      )}
    </div>
  );
}
