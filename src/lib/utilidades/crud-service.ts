import type { SupabaseClient } from "@supabase/supabase-js";
import type { BaseDatos } from "@/lib/supabase/tipos-base-datos";

type TablaBaseDatos = keyof BaseDatos["public"]["Tables"];
type ErrorSupabase = { message: string };
type RespuestaListado = {
  data: unknown[] | null;
  count: number | null;
  error: ErrorSupabase | null;
};
type RespuestaRegistro = {
  data: unknown | null;
  error: ErrorSupabase | null;
};
type ConsultaListado = PromiseLike<RespuestaListado> & {
  order: (columna: string, opciones: { ascending: boolean }) => ConsultaListado;
  range: (desde: number, hasta: number) => ConsultaListado;
};
type ConsultaRegistroSeleccionado = {
  maybeSingle: () => Promise<RespuestaRegistro>;
};
type ConsultaModificacion = {
  select: () => ConsultaRegistroSeleccionado;
};
type ConsultaActualizacion = {
  eq: (columna: string, valor: string) => ConsultaModificacion;
};
type ConsultaEliminacion = {
  eq: (columna: string, valor: string) => Promise<{ error: ErrorSupabase | null }>;
};
type TablaFlexible = {
  select: (columnas: string, opciones?: { count?: "exact" }) => ConsultaListado;
  insert: (valores: Record<string, unknown>) => ConsultaModificacion;
  update: (valores: Record<string, unknown>) => ConsultaActualizacion;
  delete: () => ConsultaEliminacion;
};
type ClienteFlexible = {
  from: (tabla: TablaBaseDatos) => TablaFlexible;
};

function obtenerTabla(cliente: SupabaseClient<BaseDatos>, tabla: TablaBaseDatos) {
  return (cliente as unknown as ClienteFlexible).from(tabla);
}

export type ResultadoServicio<T> = {
  datos: T | null;
  error: string | null;
};

export type OpcionesListado = {
  columnas?: string;
  pagina?: number;
  limite?: number;
  ordenarPor?: string;
  ascendente?: boolean;
};

export type RespuestaPaginada<T> = {
  datos: T[];
  total: number;
};

export async function listarRegistros<T>(
  cliente: SupabaseClient<BaseDatos>,
  tabla: TablaBaseDatos,
  opciones: OpcionesListado = {}
): Promise<RespuestaPaginada<T>> {
  const {
    columnas = "*",
    pagina = 1,
    limite = 20,
    ordenarPor,
    ascendente = false
  } = opciones;

  const desde = (pagina - 1) * limite;
  const hasta = desde + limite - 1;

  console.log(`⏳ [crud-service] Consultando tabla '${tabla}'...`);

  const temporizador = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Timeout: Supabase no respondió en 5 segundos")), 5000)
  );

  try {
    let consultaSupabase = obtenerTabla(cliente, tabla).select(columnas, { count: "exact" });

    // 🎯 Ordena solo si la columna es especificada explícitamente por el módulo
    if (ordenarPor) {
      consultaSupabase = consultaSupabase.order(ordenarPor, { ascending: ascendente });
    }

    consultaSupabase = consultaSupabase.range(desde, hasta);

    const { data, count, error } = await Promise.race([consultaSupabase, temporizador]);

    if (error) {
      console.error(`❌ [crud-service] Error en '${tabla}':`, error.message);
      throw new Error(error.message);
    }

    return {
      datos: (data ?? []) as T[],
      total: count ?? 0
    };
  } catch (err: unknown) {
    const mensaje = err instanceof Error ? err.message : "Error desconocido";
    console.error(`❌ [crud-service] Excepción en '${tabla}':`, mensaje);
    throw err;
  }
}

export async function crearRegistro<T>(
  cliente: SupabaseClient<BaseDatos>,
  tabla: TablaBaseDatos,
  valores: Record<string, unknown>
): Promise<ResultadoServicio<T>> {
  const { data, error } = await obtenerTabla(cliente, tabla)
    .insert(valores)
    .select()
    .maybeSingle();

  if (error) {
    return { datos: null, error: error.message };
  }

  if (!data) {
    return {
      datos: null,
      error: `El registro de '${tabla}' se creó, pero RLS impidió leer la fila resultante.`
    };
  }

  return { datos: data as T, error: null };
}

export async function actualizarRegistro<T>(
  cliente: SupabaseClient<BaseDatos>,
  tabla: TablaBaseDatos,
  id: string,
  valores: Record<string, unknown>
): Promise<ResultadoServicio<T>> {
  const { data, error } = await obtenerTabla(cliente, tabla)
    .update(valores)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    return { datos: null, error: error.message };
  }

  if (!data) {
    return {
      datos: null,
      error: `El registro de '${tabla}' se actualizó, pero RLS impidió leer la fila resultante.`
    };
  }

  return { datos: data as T, error: null };
}

export async function eliminarRegistro(
  cliente: SupabaseClient<BaseDatos>,
  tabla: TablaBaseDatos,
  id: string
): Promise<ResultadoServicio<true>> {
  const { error } = await obtenerTabla(cliente, tabla).delete().eq("id", id);

  if (error) {
    return { datos: null, error: error.message };
  }

  return { datos: true, error: null };
}

export async function desactivarRegistro<T>(
  cliente: SupabaseClient<BaseDatos>,
  tabla: TablaBaseDatos,
  id: string,
  cambios: Record<string, unknown> = { estado: "inactivo" }
) {
  return actualizarRegistro<T>(cliente, tabla, id, cambios);
}
