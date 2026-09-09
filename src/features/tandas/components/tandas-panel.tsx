"use client";

import { PanelCrud } from "@/components/common/panel-crud";
import { Insignia } from "@/components/ui/insignia";
import { Tarjeta } from "@/components/ui/tarjeta";
import { TandaCursosForm } from "@/features/tandas/forms/tanda-cursos-form";
import { camposTanda, valoresInicialesTanda } from "@/features/tandas/forms/tanda-form";
import { usarTandas } from "@/features/tandas/hooks/usar-tandas";
import { tandaSchema } from "@/features/tandas/schemas/tanda-schema";
import type { TandaRegistro } from "@/features/tandas/types/tanda-types";
import { formatearFecha } from "@/lib/utilidades/formato";

export function TandasPanel() {
  const tandasHook = usarTandas();

  return (
    <div className="grid gap-6">
      <PanelCrud<TandaRegistro>
        titulo="Tandas"
        descripcion="Aperturas temporales de cursos con fechas, estado y asignación operativa."
        campos={camposTanda}
        columnas={[
          { clave: "nombre", titulo: "Tanda", renderizar: (tanda) => tanda.nombre ?? "Sin nombre" },
          {
            clave: "fechas",
            titulo: "Fechas",
            renderizar: (tanda) => {
              const inicio = tanda.fecha_inicio ? formatearFecha(tanda.fecha_inicio) : "Sin fecha";
              const fin = tanda.fecha_fin ? formatearFecha(tanda.fecha_fin) : "Sin fecha";
              return `${inicio} - ${fin}`;
            }
          },
          {
            clave: "estado",
            titulo: "Estado",
            renderizar: (tanda) => (
              <Insignia tono={tanda.estado === "cancelada" ? "peligro" : "neutro"}>
                {tanda.estado ?? "planificada"}
              </Insignia>
            )
          }
        ]}
        datos={tandasHook.tandas as TandaRegistro[]}
        cargando={Boolean(tandasHook.cargando)}
        esquema={tandaSchema}
        valoresIniciales={valoresInicialesTanda}
        etiquetaCrear="Nueva tanda"
        crear={tandasHook.crear}
        actualizar={tandasHook.actualizar}
        desactivar={tandasHook.cancelar}
        refrescar={tandasHook.refrescar}
      />
      <Tarjeta className="p-5">
        <h2 className="mb-4 text-base font-semibold text-[var(--color-texto)]">
          Cursos por tanda
        </h2>
        <TandaCursosForm />
      </Tarjeta>
    </div>
  );
}
