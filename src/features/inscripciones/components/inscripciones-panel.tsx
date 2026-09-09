"use client";

import { Eye } from "lucide-react";
import { toast } from "sonner";
import { EncabezadoPagina } from "@/components/common/encabezado-pagina";
import { EstadoCarga } from "@/components/common/estado-carga";
import { TablaDatos } from "@/components/ui/tabla-datos";
import { Tarjeta } from "@/components/ui/tarjeta";
import { crearUrlFirmada } from "@/features/archivos/services/archivo-service";
import { InscripcionForm } from "@/features/inscripciones/forms/inscripcion-form";
import { usarInscripciones } from "@/features/inscripciones/hooks/usar-inscripciones";
import { formatearFechaHora, formatearMoneda } from "@/lib/utilidades/formato";

export function InscripcionesPanel() {
  const inscripcionesHook = usarInscripciones();

  async function verComprobante(ruta: string) {
    const respuesta = await crearUrlFirmada("comprobantes_pago", ruta);
    if (respuesta.error || !respuesta.url) {
      toast.error(respuesta.error ?? "No se pudo abrir el comprobante.");
      return;
    }
    window.open(respuesta.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid gap-6">
      <EncabezadoPagina
        titulo="Registrar inscripción"
        descripcion="Registro de estudiante, curso, tanda, monto pagado y comprobante."
      />
      <Tarjeta className="p-5">
        <InscripcionForm />
      </Tarjeta>
      {inscripcionesHook.cargando ? (
        <EstadoCarga />
      ) : (
        <TablaDatos
          columnas={[
            {
              clave: "fecha",
              titulo: "Fecha",
              renderizar: (fila) => formatearFechaHora(fila.creado_en)
            },
            {
              clave: "estudiante",
              titulo: "Estudiante",
              renderizar: (fila) =>
                fila.estudiantes
                  ? `${fila.estudiantes.nombres} ${fila.estudiantes.apellidos}`
                  : "Sin estudiante"
            },
            {
              clave: "curso",
              titulo: "Curso",
              renderizar: (fila) => fila.cursos?.nombre ?? "Sin curso"
            },
            {
              clave: "tanda",
              titulo: "Tanda",
              renderizar: (fila) => fila.tandas?.nombre ?? "Sin tanda"
            },
            {
              clave: "monto",
              titulo: "Monto",
              renderizar: (fila) => formatearMoneda(fila.monto_pagado ?? 0)
            },
            {
              clave: "comprobante",
              titulo: "Comprobante",
              renderizar: (fila) =>
                fila.comprobante_url ? (
                  <button
                    type="button"
                    onClick={() => verComprobante(fila.comprobante_url!)}
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--color-primario)] hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver comprobante
                  </button>
                ) : (
                  <span className="text-xs text-[var(--color-texto-secundario)]">Sin comprobante</span>
                )
            }
          ]}
          datos={inscripcionesHook.inscripciones}
          obtenerClave={(fila) => fila.id}
          vacio="Sin inscripciones registradas"
        />
      )}
    </div>
  );
}