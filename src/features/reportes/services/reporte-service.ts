import type { SupabaseClient } from "@supabase/supabase-js";
import type { MetricasAdministrativas } from "@/features/reportes/types/reporte-types";
import type { BaseDatos } from "@/lib/supabase/tipos-base-datos";

export type FiltrosMetricasAdministrativas = {
  tanda_id?: string;
};

type InscripcionMetrica = {
  estudiante_id: string;
  curso_id: string;
  monto_pagado: number;
};

type LiquidacionMetrica = {
  id: string;
  monto_docente: number;
  monto_empresa: number | null;
  monto_instituto: number | null;
  estado: string;
};

function sumarMontos<T>(filas: T[], selector: (fila: T) => number | string | null | undefined) {
  return filas.reduce((total, fila) => {
    const valor = Number(selector(fila) ?? 0);
    return total + (Number.isFinite(valor) ? valor : 0);
  }, 0);
}

async function listarInscripcionesMetricas(
  cliente: SupabaseClient<BaseDatos>,
  tandaId?: string
) {
  let consulta = cliente.from("inscripciones").select("estudiante_id, curso_id, monto_pagado");
  if (tandaId) consulta = consulta.eq("tanda_id", tandaId);

  const { data, error } = await consulta;
  if (error) throw new Error(error.message);
  return (data ?? []) as InscripcionMetrica[];
}

async function listarLiquidacionesMetricas(
  cliente: SupabaseClient<BaseDatos>,
  tandaId?: string
) {
  let consulta = cliente
    .from("liquidaciones")
    .select("id, monto_docente, monto_empresa, monto_instituto, estado");
  if (tandaId) consulta = consulta.eq("tanda_id", tandaId);

  const { data, error } = await consulta;
  if (error) throw new Error(error.message);
  return (data ?? []) as LiquidacionMetrica[];
}

async function contarCursos(cliente: SupabaseClient<BaseDatos>, tandaId?: string) {
  if (tandaId) {
    const { data, error } = await cliente
      .from("tanda_cursos")
      .select("curso_id")
      .eq("tanda_id", tandaId);
    if (error) throw new Error(error.message);
    return new Set((data ?? []).map((fila) => fila.curso_id)).size;
  }

  const { count, error } = await cliente
    .from("cursos")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function contarEstudiantes(cliente: SupabaseClient<BaseDatos>) {
  const { count, error } = await cliente
    .from("estudiantes")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function contarPagos(
  cliente: SupabaseClient<BaseDatos>,
  liquidacionIds: string[] | null
) {
  if (liquidacionIds && liquidacionIds.length === 0) return 0;

  let consulta = cliente.from("pagos_docentes").select("id", { count: "exact", head: true });
  if (liquidacionIds) consulta = consulta.in("liquidacion_id", liquidacionIds);

  const { count, error } = await consulta;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function obtenerMetricasAdministrativas(
  cliente: SupabaseClient<BaseDatos>,
  filtros: FiltrosMetricasAdministrativas = {}
): Promise<MetricasAdministrativas> {
  const tandaId = filtros.tanda_id?.trim() || undefined;

  const [inscripciones, liquidaciones, totalCursos] = await Promise.all([
    listarInscripcionesMetricas(cliente, tandaId),
    listarLiquidacionesMetricas(cliente, tandaId),
    contarCursos(cliente, tandaId)
  ]);

  const totalEstudiantes = tandaId
    ? new Set(inscripciones.map((inscripcion) => inscripcion.estudiante_id)).size
    : await contarEstudiantes(cliente);
  const liquidacionIds = tandaId ? liquidaciones.map((liquidacion) => liquidacion.id) : null;
  const pagosRealizados = await contarPagos(cliente, liquidacionIds);
  const liquidacionesPendientes = liquidaciones.filter(
    (liquidacion) => liquidacion.estado === "pendiente"
  ).length;

  return {
    total_cursos: totalCursos,
    total_estudiantes: totalEstudiantes,
    total_inscripciones: inscripciones.length,
    ingresos: sumarMontos(inscripciones, (inscripcion) => inscripcion.monto_pagado),
    ganancias_instituto: sumarMontos(
      liquidaciones,
      (liquidacion) => liquidacion.monto_empresa ?? liquidacion.monto_instituto
    ),
    ganancias_docentes: sumarMontos(liquidaciones, (liquidacion) => liquidacion.monto_docente),
    liquidaciones_pendientes: liquidacionesPendientes,
    pagos_pendientes: liquidacionesPendientes,
    pagos_realizados: pagosRealizados
  };
}
