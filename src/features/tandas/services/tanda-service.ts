import type { SupabaseClient } from "@supabase/supabase-js";
import {
  actualizarRegistro,
  crearRegistro,
  listarRegistros,
  type OpcionesListado
} from "@/lib/utilidades/crud-service";
import type { BaseDatos, Tanda, TandaCurso } from "@/lib/supabase/tipos-base-datos";

export function listarTandas(
  cliente: SupabaseClient<BaseDatos>,
  opciones: OpcionesListado = {}
) {
  return listarRegistros<Tanda>(cliente, "tandas", {
    columnas: "*",
    ordenarPor: "fecha_inicio",
    ascendente: false,
    ...opciones
  });
}

export function listarTandaCursos(
  cliente: SupabaseClient<BaseDatos>,
  opciones: OpcionesListado = {}
) {
  return listarRegistros<TandaCurso>(cliente, "tanda_cursos", {
    columnas: "*",
    ordenarPor: "id",
    ascendente: true,
    ...opciones
  });
}

export async function listarTandasOpciones(cliente: SupabaseClient<BaseDatos>) {
  const clienteCrud = cliente as unknown as {
    from: (tabla: string) => {
      select: (columnas: string) => {
        order: (
          columna: string,
          opciones: { ascending: boolean }
        ) => Promise<{ data: Array<{ id: string; nombre: string }> | null }>;
      };
    };
  };

  const { data } = await clienteCrud
    .from("tandas")
    .select("id, nombre")
    .order("nombre", { ascending: true });

  return (data ?? []).map((tanda) => ({
    valor: tanda.id,
    etiqueta: tanda.nombre
  }));
}

export function crearTanda(cliente: SupabaseClient<BaseDatos>, valores: Record<string, unknown>) {
  return crearRegistro<Tanda>(cliente, "tandas", valores);
}

export function actualizarTanda(
  cliente: SupabaseClient<BaseDatos>,
  id: string,
  valores: Record<string, unknown>
) {
  return actualizarRegistro<Tanda>(cliente, "tandas", id, valores);
}

export function cancelarTanda(cliente: SupabaseClient<BaseDatos>, id: string) {
  return actualizarRegistro<Tanda>(cliente, "tandas", id, { estado: "cancelada" });
}

export function desactivarTanda(cliente: SupabaseClient<BaseDatos>, id: string) {
  return cancelarTanda(cliente, id);
}
