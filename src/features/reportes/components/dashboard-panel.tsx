"use client";

import { Banknote, BookOpen, Clock, GraduationCap, TrendingUp, Users } from "lucide-react";
import { EncabezadoPagina } from "@/components/common/encabezado-pagina";
import { TarjetaMetrica } from "@/components/common/tarjeta-metrica";
import { usarPerfilActual } from "@/features/autenticacion/hooks/usar-perfil-actual";
import { usarMetricasAdministrativas } from "@/features/reportes/hooks/usar-reportes";
import { formatearMoneda } from "@/lib/utilidades/formato";

export function DashboardPanel() {
  const perfil = usarPerfilActual();
  const metricas = usarMetricasAdministrativas();

  const rol = perfil.data?.rol || "superadmin";

  const datosSeguros = metricas.data ?? {
    total_cursos: 0,
    total_estudiantes: 0,
    ganancias_docentes: 0,
    pagos_realizados: 0,
    total_inscripciones: 0,
    ingresos: 0,
    ganancias_instituto: 0,
    liquidaciones_pendientes: 0,
    pagos_pendientes: 0
  };

  const tarjetas =
    rol === "docente"
      ? [
          {
            titulo: "Cursos asignados",
            valor: datosSeguros.total_cursos.toString(),
            icono: BookOpen
          },
          {
            titulo: "Alumnos inscritos",
            valor: datosSeguros.total_estudiantes.toString(),
            icono: Users
          },
          {
            titulo: "Ganancias acumuladas",
            valor: formatearMoneda(datosSeguros.ganancias_docentes),
            icono: TrendingUp
          },
          {
            titulo: "Pagos realizados",
            valor: datosSeguros.pagos_realizados.toString(),
            icono: Banknote
          }
        ]
      : [
          {
            titulo: "Estudiantes inscritos",
            valor: datosSeguros.total_inscripciones.toString(),
            icono: GraduationCap
          },
          {
            titulo: "Ingresos",
            valor: formatearMoneda(datosSeguros.ingresos),
            icono: Banknote
          },
          {
            titulo: "Ganancias instituto",
            valor: formatearMoneda(datosSeguros.ganancias_instituto),
            icono: TrendingUp
          },
          {
            titulo: "Liquidaciones pendientes",
            valor: datosSeguros.liquidaciones_pendientes.toString(),
            icono: Clock
          }
        ];

  return (
    <div className="grid gap-6">
      {metricas.isError && (
        <div className="rounded-md border border-[var(--color-peligro)] bg-[var(--color-panel)] p-4 text-sm text-[var(--color-peligro)]">
          {(metricas.error as Error)?.message || "No se pudieron cargar las métricas."}
        </div>
      )}

      <EncabezadoPagina
        titulo="Dashboard"
        descripcion="Vista general del ciclo académico y financiero de DigitalServices."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tarjetas.map((tarjeta) => (
          <TarjetaMetrica
            key={tarjeta.titulo}
            titulo={tarjeta.titulo}
            valor={tarjeta.valor}
            icono={tarjeta.icono}
          />
        ))}
      </div>
    </div>
  );
}
