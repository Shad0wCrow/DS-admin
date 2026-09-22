"use client";

import { Banknote, BookOpen, GraduationCap, RotateCcw, TrendingUp, Users, WalletCards } from "lucide-react";
import { useState } from "react";
import { EncabezadoPagina } from "@/components/common/encabezado-pagina";
import { EstadoCarga } from "@/components/common/estado-carga";
import { TarjetaMetrica } from "@/components/common/tarjeta-metrica";
import { Boton } from "@/components/ui/boton";
import { Selector } from "@/components/ui/campo";
import { usarMetricasAdministrativas } from "@/features/reportes/hooks/usar-reportes";
import { usarTandas } from "@/features/tandas/hooks/usar-tandas";
import { formatearMoneda } from "@/lib/utilidades/formato";

export function ReportesPanel() {
  const [tandaId, setTandaId] = useState("");
  const { data: metricas, isLoading, refetch, isFetching } = usarMetricasAdministrativas({
    tanda_id: tandaId || undefined
  });
  const tandas = usarTandas();

  return (
    <div className="grid gap-6">
      <EncabezadoPagina
        titulo="Reportes"
        descripcion="Resumen financiero y operativo de inscripciones, ganancias y pagos."
        acciones={
          <Boton variante="secundario" onClick={() => void refetch()} cargando={isFetching}>
            <RotateCcw className="h-4 w-4" />
            Actualizar
          </Boton>
        }
      />
      <div className="max-w-md">
        <Selector
          etiqueta="Tanda de curso"
          value={tandaId}
          onChange={(evento) => setTandaId(evento.target.value)}
          opciones={[
            { etiqueta: "Todas las tandas", valor: "" },
            ...tandas.tandas.map((tanda) => ({ etiqueta: tanda.nombre, valor: tanda.id }))
          ]}
        />
      </div>
      {isLoading || !metricas ? (
        <EstadoCarga />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <TarjetaMetrica
            titulo="Estudiantes"
            valor={metricas.total_estudiantes.toString()}
            icono={Users}
          />
          <TarjetaMetrica titulo="Cursos" valor={metricas.total_cursos.toString()} icono={BookOpen} />
          <TarjetaMetrica
            titulo="Inscripciones"
            valor={metricas.total_inscripciones.toString()}
            icono={GraduationCap}
          />
          <TarjetaMetrica titulo="Ingresos" valor={formatearMoneda(metricas.ingresos)} icono={Banknote} />
          <TarjetaMetrica
            titulo="Ganancia instituto"
            valor={formatearMoneda(metricas.ganancias_instituto)}
            icono={TrendingUp}
          />
          <TarjetaMetrica
            titulo="Liquidaciones pendientes"
            valor={metricas.liquidaciones_pendientes.toString()}
            icono={WalletCards}
          />
        </div>
      )}
    </div>
  );
}
