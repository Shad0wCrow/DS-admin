"use client";

import { EncabezadoPagina } from "@/components/common/encabezado-pagina";
import { EstadoCarga } from "@/components/common/estado-carga";
import { Tarjeta } from "@/components/ui/tarjeta";
import { TablaDatos } from "@/components/ui/tabla-datos";
import { PagoForm } from "@/features/pagos/forms/pago-form";
import { usarPagos } from "@/features/pagos/hooks/usar-pagos";
import { formatearFechaHora, formatearMoneda } from "@/lib/utilidades/formato";

export function PagosPanel() {
  const pagosHook = usarPagos();

  return (
    <div className="grid gap-6">
      <EncabezadoPagina
        titulo="Pagos a docentes"
        descripcion="Registro de pagos asociados a liquidaciones pendientes."
      />
      <Tarjeta className="p-5">
        <PagoForm />
      </Tarjeta>
      {pagosHook.cargando ? (
        <EstadoCarga />
      ) : (
        <TablaDatos
          columnas={[
            {
              clave: "fecha",
              titulo: "Fecha",
              renderizar: (fila) => formatearFechaHora(fila.fecha_pago)
            },
            {
              clave: "docente",
              titulo: "Docente",
              renderizar: (fila) =>
                fila.liquidaciones?.docentes?.usuarios
                  ? `${fila.liquidaciones.docentes.usuarios.nombres} ${fila.liquidaciones.docentes.usuarios.apellidos}`
                  : fila.liquidaciones?.docente_id ?? "Sin docente"
            },
            {
              clave: "tanda",
              titulo: "Tanda",
              renderizar: (fila) => fila.liquidaciones?.tandas?.nombre ?? "Sin tanda"
            },
            {
              clave: "monto",
              titulo: "Monto",
              renderizar: (fila) => formatearMoneda(fila.monto ?? 0)
            },
            {
              clave: "liquidacion",
              titulo: "Liquidación",
              renderizar: (fila) => fila.liquidaciones?.estado ?? "PAGADO"
            }
          ]}
          datos={pagosHook.pagos}
          obtenerClave={(fila) => fila.id}
          vacio="Sin pagos registrados"
        />
      )}
    </div>
  );
}
