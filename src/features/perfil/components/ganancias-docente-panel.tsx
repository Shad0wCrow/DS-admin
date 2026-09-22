"use client";

import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { EstadoCarga } from "@/components/common/estado-carga";
import { Boton } from "@/components/ui/boton";
import { Selector } from "@/components/ui/campo";
import { Insignia } from "@/components/ui/insignia";
import { TablaDatos } from "@/components/ui/tabla-datos";
import { usarGananciasDocente, usarPerfilDocente } from "@/features/perfil/hooks/usar-perfil";
import { usarTandas } from "@/features/tandas/hooks/usar-tandas";
import { formatearFechaHora, formatearMoneda } from "@/lib/utilidades/formato";

const meses = [
  { etiqueta: "Todos los meses", valor: "" },
  { etiqueta: "Enero", valor: "1" },
  { etiqueta: "Febrero", valor: "2" },
  { etiqueta: "Marzo", valor: "3" },
  { etiqueta: "Abril", valor: "4" },
  { etiqueta: "Mayo", valor: "5" },
  { etiqueta: "Junio", valor: "6" },
  { etiqueta: "Julio", valor: "7" },
  { etiqueta: "Agosto", valor: "8" },
  { etiqueta: "Septiembre", valor: "9" },
  { etiqueta: "Octubre", valor: "10" },
  { etiqueta: "Noviembre", valor: "11" },
  { etiqueta: "Diciembre", valor: "12" }
];

export function GananciasDocentePanel() {
  const perfil = usarPerfilDocente();
  const tandas = usarTandas();
  const [tandaId, setTandaId] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const ganancias = usarGananciasDocente(perfil.docente?.id, {
    tanda_id: tandaId || undefined,
    mes: mes || undefined,
    anio: anio || undefined
  });

  const anios = useMemo(() => {
    const actual = new Date().getFullYear();
    return [
      { etiqueta: "Todos los años", valor: "" },
      ...Array.from({ length: 6 }, (_, indice) => {
        const valor = String(actual - indice);
        return { etiqueta: valor, valor };
      })
    ];
  }, []);

  const totalDocente = ganancias.ganancias.reduce(
    (total, liquidacion) => total + Number(liquidacion.monto_docente ?? 0),
    0
  );

  if (!perfil.docente) return null;

  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-texto)]">Ganancias</h2>
          <p className="mt-1 text-sm text-[var(--color-texto-secundario)]">
            Total filtrado: {formatearMoneda(totalDocente)}
          </p>
        </div>
        <Boton variante="secundario" onClick={ganancias.refrescar}>
          <RotateCcw className="h-4 w-4" />
          Actualizar
        </Boton>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Selector
          etiqueta="Tanda"
          value={tandaId}
          onChange={(evento) => setTandaId(evento.target.value)}
          opciones={[
            { etiqueta: "Todas las tandas", valor: "" },
            ...tandas.tandas.map((tanda) => ({ etiqueta: tanda.nombre, valor: tanda.id }))
          ]}
        />
        <Selector
          etiqueta="Mes"
          value={mes}
          onChange={(evento) => setMes(evento.target.value)}
          opciones={meses}
        />
        <Selector
          etiqueta="Año"
          value={anio}
          onChange={(evento) => setAnio(evento.target.value)}
          opciones={anios}
        />
      </div>

      {ganancias.cargando ? (
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
              clave: "tanda",
              titulo: "Tanda",
              renderizar: (fila) => fila.tandas?.nombre ?? "Sin tanda"
            },
            {
              clave: "inscritos",
              titulo: "Inscritos",
              renderizar: (fila) => fila.cantidad_inscritos
            },
            {
              clave: "monto",
              titulo: "Ganancia",
              renderizar: (fila) => formatearMoneda(fila.monto_docente)
            },
            {
              clave: "estado",
              titulo: "Estado",
              renderizar: (fila) => (
                <Insignia tono={fila.estado === "PAGADO" ? "exito" : fila.estado === "ANULADA" ? "peligro" : "neutro"}>
                  {fila.estado}
                </Insignia>
              )
            }
          ]}
          datos={ganancias.ganancias}
          obtenerClave={(fila) => fila.id}
          vacio="Sin ganancias para los filtros seleccionados"
        />
      )}
    </section>
  );
}
