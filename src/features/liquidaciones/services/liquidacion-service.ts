import type { SupabaseClient } from "@supabase/supabase-js";
import { actualizarRegistro, crearRegistro } from "@/lib/utilidades/crud-service";
import type {
  BaseDatos,
  Curso,
  Liquidacion
} from "@/lib/supabase/tipos-base-datos";
import type {
  CursoLiquidacionDetalle,
  LiquidacionDetalle,
  LiquidacionRegistro
} from "@/features/liquidaciones/types/liquidacion-types";
type ConfiguracionLiquidacion = {
  porcentaje_docente: number;
  porcentaje_empresa: number;
};
type CursoInfo = {
  id: string;
  nombre: string;
  precio: number;
  docente_id?: string | null;
};
type GrupoLiquidacion = {
  docente_id: string;
  cursos: CursoLiquidacionDetalle[];
  cantidad_inscritos: number;
  monto_total: number;
  monto_docente: number;
  monto_instituto: number;
};
export type ResultadoSincronizacionLiquidaciones = {
  generadas: number;
  actualizadas: number;
  omitidas_pagadas: number;
  cursos_sin_docente?: string[];
};
export const ESTADO_PENDIENTE = "PENDIENTE";
export const ESTADO_PAGADO = "PAGADO";
function redondearMonto(valor: number) {
  return Math.round(valor * 100) / 100;
}
function numeroSeguro(valor: number | string | null | undefined) {
  const numero = Number(valor ?? 0);
  return Number.isFinite(numero) ? numero : 0;
}
function esUrlAbsoluta(valor: string) {
  return /^https?:\/\//i.test(valor);
}
function limpiarRutaStorage(ruta: string) {
  return ruta.trim().replace(/^\/+|\/+$/g, "").replace(/^archivos_docentes\//, "");
}
async function obtenerConfiguracionLiquidacion(
  cliente: SupabaseClient<BaseDatos>
): Promise<ConfiguracionLiquidacion> {
  const { data, error } = await cliente
    .from("configuracion")
    .select("porcentaje_docente, porcentaje_empresa")
    .order("actualizado_en", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return {
    porcentaje_docente: numeroSeguro(data?.porcentaje_docente ?? 60),
    porcentaje_empresa: numeroSeguro(data?.porcentaje_empresa ?? 40)
  };
}
/**
 * Resuelve el docente asignado a un curso dentro de una tanda.
 * Única fuente de verdad: la relación tanda_cursos.docente_id (o, si en el
 * futuro se agregan, inscripciones.docente_id / cursos.docente_id).
 * Si no hay relación registrada, el curso queda como "sin docente" en vez
 * de adivinar: eso evita que cursos ajenos se mezclen en la liquidación de
 * otro docente.
 */
function resolverDocenteId(
  inscripcion: any,
  cursoInfo: CursoInfo | undefined,
  mapaTandaCursosDocentes: Map<string, string>
): string | null {
  if (inscripcion.docente_id) {
    return inscripcion.docente_id;
  }
  if (cursoInfo?.docente_id) {
    return cursoInfo.docente_id;
  }
  if (inscripcion.curso_id && mapaTandaCursosDocentes.has(inscripcion.curso_id)) {
    return mapaTandaCursosDocentes.get(inscripcion.curso_id) ?? null;
  }
  return null;
}
async function calcularGruposLiquidacion(cliente: SupabaseClient<BaseDatos>, tandaId: string) {
  const configuracion = await obtenerConfiguracionLiquidacion(cliente);
  // 1. Obtener la lista base de docentes (solo para contar cuántos existen)
  const { data: docentes } = await cliente.from("docentes").select("id");
  const totalDocentesEncontrados = (docentes ?? []).length;
  // 2. Obtener tanda_cursos, que ahora incluye el docente asignado por curso
  const { data: relaciones } = await cliente
    .from("tanda_cursos")
    .select("*")
    .eq("tanda_id", tandaId);
  const mapaTandaCursosDocentes = new Map<string, string>();
  (relaciones ?? []).forEach((r: any) => {
    if (r.curso_id && r.docente_id) {
      mapaTandaCursosDocentes.set(r.curso_id, r.docente_id);
    }
  });
  // 3. Obtener inscripciones
  const { data: inscripciones, error: errorInscripciones } = await cliente
    .from("inscripciones")
    .select("*")
    .eq("tanda_id", tandaId);
  if (errorInscripciones) throw new Error(`Error en inscripciones: ${errorInscripciones.message}`);
  const setCursoIds = new Set<string>();
  (relaciones ?? []).forEach((r: any) => r.curso_id && setCursoIds.add(r.curso_id));
  (inscripciones ?? []).forEach((i: any) => i.curso_id && setCursoIds.add(i.curso_id));
  const cursoIds = Array.from(setCursoIds);
  if (cursoIds.length === 0) {
    return {
      configuracion,
      grupos: [],
      cursosSinDocente: [],
      totalInscripciones: 0,
      totalDocentesEncontrados
    };
  }
  // 4. Obtener catálogo de cursos
  const { data: cursos, error: errorCursos } = await cliente
    .from("cursos")
    .select("*")
    .in("id", cursoIds);
  if (errorCursos) throw new Error(`Error en tabla cursos: ${errorCursos.message}`);
  const mapaCursos = new Map<string, CursoInfo>();
  (cursos ?? []).forEach((c: any) => {
    mapaCursos.set(c.id, {
      id: c.id,
      nombre: c.nombre,
      precio: numeroSeguro(c.precio),
      docente_id: c.docente_id ?? null
    });
  });
  const setCursosSinDocente = new Set<string>();
  const mapaDocenteCurso = new Map<
    string,
    Map<string, { curso_nombre: string; cantidad: number; monto_total: number }>
  >();
  const listaInscripciones = inscripciones ?? [];
  for (const item of listaInscripciones as any[]) {
    const cursoInfo = mapaCursos.get(item.curso_id);
    const cursoNombre = cursoInfo?.nombre ?? "Curso sin nombre";
    const precioBase = cursoInfo?.precio ?? 0;
    const montoDirecto = numeroSeguro(item.monto_pagado ?? item.monto ?? item.monto_total);
    const montoFinal = montoDirecto > 0 ? montoDirecto : precioBase;
    const docenteId = resolverDocenteId(item, cursoInfo, mapaTandaCursosDocentes);
    if (!docenteId) {
      setCursosSinDocente.add(cursoNombre);
      continue;
    }
    let mapaCursosDocente = mapaDocenteCurso.get(docenteId);
    if (!mapaCursosDocente) {
      mapaCursosDocente = new Map();
      mapaDocenteCurso.set(docenteId, mapaCursosDocente);
    }
    const acumuladoCurso = mapaCursosDocente.get(item.curso_id) ?? {
      curso_nombre: cursoNombre,
      cantidad: 0,
      monto_total: 0
    };
    acumuladoCurso.cantidad += 1;
    acumuladoCurso.monto_total = redondearMonto(acumuladoCurso.monto_total + montoFinal);
    mapaCursosDocente.set(item.curso_id, acumuladoCurso);
  }
  // 5. Agrupar por docente
  const grupos: GrupoLiquidacion[] = [];
  for (const [docenteId, mapaCursosDocente] of mapaDocenteCurso.entries()) {
    const listaDetalleCursos: CursoLiquidacionDetalle[] = [];
    let totalInscritos = 0;
    let totalMonto = 0;
    for (const [cursoId, info] of mapaCursosDocente.entries()) {
      const montoDocenteCurso = redondearMonto(
        info.monto_total * (configuracion.porcentaje_docente / 100)
      );
      const montoInstitutoCurso = redondearMonto(
        info.monto_total * (configuracion.porcentaje_empresa / 100)
      );
      listaDetalleCursos.push({
        curso_id: cursoId,
        curso_nombre: info.curso_nombre,
        cantidad_inscritos: info.cantidad,
        monto_total: info.monto_total,
        monto_docente: montoDocenteCurso,
        monto_instituto: montoInstitutoCurso
      });
      totalInscritos += info.cantidad;
      totalMonto = redondearMonto(totalMonto + info.monto_total);
    }
    const montoDocenteTotal = redondearMonto(
      totalMonto * (configuracion.porcentaje_docente / 100)
    );
    const montoInstitutoTotal = redondearMonto(
      totalMonto * (configuracion.porcentaje_empresa / 100)
    );
    grupos.push({
      docente_id: docenteId,
      cursos: listaDetalleCursos,
      cantidad_inscritos: totalInscritos,
      monto_total: totalMonto,
      monto_docente: montoDocenteTotal,
      monto_instituto: montoInstitutoTotal
    });
  }
  return {
    configuracion,
    grupos,
    cursosSinDocente: Array.from(setCursosSinDocente),
    totalInscripciones: listaInscripciones.length,
    totalDocentesEncontrados
  };
}
async function crearQrUrl(cliente: SupabaseClient<BaseDatos>, ruta: string | null | undefined) {
  if (!ruta) return { url: null, error: null };
  if (esUrlAbsoluta(ruta)) return { url: ruta, error: null };
  const { data, error } = await cliente.storage
    .from("archivos_docentes")
    .createSignedUrl(limpiarRutaStorage(ruta), 60 * 10);
  if (error) return { url: null, error: error.message };
  return { url: data.signedUrl, error: null };
}
export async function listarLiquidaciones(
  cliente: SupabaseClient<BaseDatos>,
  tandaId?: string
) {
  let consulta = cliente
    .from("liquidaciones")
    .select("*, docentes(*, usuarios(*)), tandas(*)", { count: "exact" });
  if (tandaId) {
    consulta = consulta.eq("tanda_id", tandaId);
  }
  const { data, count, error } = await consulta
    .order("creado_en", { ascending: false })
    .range(0, 199);
  if (error) throw new Error(error.message);
  return {
    datos: (data ?? []) as LiquidacionRegistro[],
    total: count ?? 0
  };
}
export async function sincronizarLiquidacionesTanda(
  cliente: SupabaseClient<BaseDatos>,
  tandaId: string
) {
  if (!tandaId) return { datos: null, error: "Selecciona una tanda." };
  try {
    const { grupos, cursosSinDocente, totalInscripciones, totalDocentesEncontrados } =
      await calcularGruposLiquidacion(cliente, tandaId);
    if (totalInscripciones === 0) {
      return {
        datos: null,
        error: "Esta tanda no tiene inscripciones registradas."
      };
    }
    if (totalDocentesEncontrados === 0 && grupos.length === 0) {
      return {
        datos: null,
        error: "No se encontraron docentes en la tabla 'docentes' para asociar a estas inscripciones."
      };
    }
    if (grupos.length === 0) {
      return {
        datos: null,
        error: `Se encontraron ${totalInscripciones} inscripciones, pero ningún curso tiene un docente asignado en la tanda (revisa tanda_cursos).`
      };
    }
    const { data: existentes, error: errorExistentes } = await cliente
      .from("liquidaciones")
      .select("*")
      .eq("tanda_id", tandaId);
    if (errorExistentes) return { datos: null, error: errorExistentes.message };
    const existentesPorDocente = new Map<string, Liquidacion[]>();
    for (const liquidacion of (existentes ?? []) as Liquidacion[]) {
      const lista = existentesPorDocente.get(liquidacion.docente_id) ?? [];
      lista.push(liquidacion);
      existentesPorDocente.set(liquidacion.docente_id, lista);
    }
    const resultado: ResultadoSincronizacionLiquidaciones = {
      generadas: 0,
      actualizadas: 0,
      omitidas_pagadas: 0,
      cursos_sin_docente: cursosSinDocente
    };
    for (const grupo of grupos) {
      const liquidacionesDocente = existentesPorDocente.get(grupo.docente_id) ?? [];
      const liquidacionPendiente = liquidacionesDocente.find(
        (liquidacion) => String(liquidacion.estado).toUpperCase() === ESTADO_PENDIENTE
      );
      const tienePagada = liquidacionesDocente.some(
        (liquidacion) => String(liquidacion.estado).toUpperCase() === ESTADO_PAGADO
      );
      const payload = {
        docente_id: grupo.docente_id,
        tanda_id: tandaId,
        cantidad_inscritos: grupo.cantidad_inscritos,
        monto_total: grupo.monto_total,
        monto_docente: grupo.monto_docente,
        monto_empresa: grupo.monto_instituto,
        monto_instituto: grupo.monto_instituto,
        estado: ESTADO_PENDIENTE as any
      };
      if (liquidacionPendiente) {
        const actualizacion = await actualizarRegistro<Liquidacion>(
          cliente,
          "liquidaciones",
          liquidacionPendiente.id,
          payload
        );
        if (actualizacion.error) return { datos: null, error: actualizacion.error };
        resultado.actualizadas += 1;
        continue;
      }
      if (tienePagada) {
        resultado.omitidas_pagadas += 1;
        continue;
      }
      const creacion = await crearRegistro<Liquidacion>(cliente, "liquidaciones", payload);
      if (creacion.error) return { datos: null, error: creacion.error };
      resultado.generadas += 1;
    }
    return { datos: resultado, error: null };
  } catch (error) {
    return {
      datos: null,
      error: error instanceof Error ? error.message : "No se pudieron calcular las liquidaciones."
    };
  }
}
export async function obtenerDetalleLiquidacion(
  cliente: SupabaseClient<BaseDatos>,
  liquidacionId: string
) {
  if (!liquidacionId) return { datos: null, error: "Selecciona una liquidación." };
  try {
    const { data: liquidacion, error } = await cliente
      .from("liquidaciones")
      .select("*, docentes(*, usuarios(*)), tandas(*)")
      .eq("id", liquidacionId)
      .maybeSingle();
    if (error) return { datos: null, error: error.message };
    if (!liquidacion) return { datos: null, error: "No se encontró la liquidación." };
    const registro = liquidacion as LiquidacionRegistro;
    const { configuracion, grupos } = await calcularGruposLiquidacion(cliente, registro.tanda_id);
    const grupo = grupos.find((item) => item.docente_id === registro.docente_id);
    const qr = await crearQrUrl(cliente, registro.docentes?.qr_url);
    const montoTotal = grupo ? grupo.monto_total : numeroSeguro(registro.monto_total);
    const montoDocente = grupo ? grupo.monto_docente : numeroSeguro(registro.monto_docente);
    const montoInstituto = grupo
      ? grupo.monto_instituto
      : numeroSeguro(registro.monto_empresa ?? registro.monto_instituto);
    const cantidadInscritos = grupo
      ? grupo.cantidad_inscritos
      : numeroSeguro(registro.cantidad_inscritos);
    if (String(registro.estado).toUpperCase() === ESTADO_PENDIENTE && grupo) {
      await actualizarRegistro<Liquidacion>(cliente, "liquidaciones", registro.id, {
        cantidad_inscritos: cantidadInscritos,
        monto_total: montoTotal,
        monto_docente: montoDocente,
        monto_empresa: montoInstituto,
        monto_instituto: montoInstituto
      });
    }
    const detalle: LiquidacionDetalle = {
      liquidacion: {
        ...registro,
        monto_total: montoTotal,
        monto_docente: montoDocente,
        monto_empresa: montoInstituto,
        monto_instituto: montoInstituto,
        cantidad_inscritos: cantidadInscritos
      },
      cursos: grupo?.cursos ?? [],
      porcentaje_docente: configuracion.porcentaje_docente,
      porcentaje_empresa: configuracion.porcentaje_empresa,
      monto_total: montoTotal,
      monto_docente: montoDocente,
      monto_instituto: montoInstituto,
      qr_url: qr.url,
      qr_error: qr.error
    };
    return { datos: detalle, error: null };
  } catch (error) {
    return {
      datos: null,
      error: error instanceof Error ? error.message : "No se pudo cargar el detalle."
    };
  }
}
export function cambiarEstadoLiquidacion(
  cliente: SupabaseClient<BaseDatos>,
  id: string,
  nuevoEstado: "PENDIENTE" | "PAGADO"
) {
  return actualizarRegistro<Liquidacion>(cliente, "liquidaciones", id, {
    estado: nuevoEstado as any
  });
}
export function marcarComoPagada(cliente: SupabaseClient<BaseDatos>, id: string) {
  return cambiarEstadoLiquidacion(cliente, id, "PAGADO");
}
export function marcarComoPendiente(cliente: SupabaseClient<BaseDatos>, id: string) {
  return cambiarEstadoLiquidacion(cliente, id, "PENDIENTE");
}
export function anularLiquidacion(cliente: SupabaseClient<BaseDatos>, id: string) {
  return cambiarEstadoLiquidacion(cliente, id, "PENDIENTE");
}
export function actualizarLiquidacion(
  cliente: SupabaseClient<BaseDatos>,
  id: string,
  valores: Record<string, unknown>
) {
  return actualizarRegistro<Liquidacion>(cliente, "liquidaciones", id, valores);
}