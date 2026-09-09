"use client";

import { RotateCcw } from "lucide-react";
import { EncabezadoPagina } from "@/components/common/encabezado-pagina";
import { EstadoCarga } from "@/components/common/estado-carga";
import { Boton } from "@/components/ui/boton";
import { TablaDatos } from "@/components/ui/tabla-datos";
import { usarAuditoria } from "@/features/auditoria/hooks/usar-auditoria";
import { formatearFechaHora } from "@/lib/utilidades/formato";

export function AuditoriaPanel() {
  const auditoria = usarAuditoria();

  return (
    <div className="grid gap-6">
      <EncabezadoPagina
        titulo="Auditoría"
        descripcion="Historial de creación, modificación, eliminación y cambios financieros."
        acciones={
          <Boton variante="secundario" onClick={auditoria.refrescar}>
            <RotateCcw className="h-4 w-4" />
            Actualizar
          </Boton>
        }
      />
      {auditoria.cargando ? (
        <EstadoCarga />
      ) : (
        <TablaDatos
          columnas={[
            { clave: "fecha", titulo: "Fecha", renderizar: (fila) => formatearFechaHora(fila.fecha) },
            { clave: "accion", titulo: "Acción", renderizar: (fila) => fila.accion },
            { clave: "tabla", titulo: "Tabla", renderizar: (fila) => fila.tabla_afectada },
            {
              clave: "registro",
              titulo: "Registro",
              renderizar: (fila) => fila.registro_id ?? "Sin registro"
            }
          ]}
          datos={auditoria.registros}
          obtenerClave={(fila) => fila.id}
          vacio="Sin registros de auditoría"
        />
      )}
    </div>
  );
}
