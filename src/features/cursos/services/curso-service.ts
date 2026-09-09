import type { SupabaseClient } from "@supabase/supabase-js";
import {
  actualizarRegistro,
  crearRegistro,
  desactivarRegistro,
  listarRegistros
} from "@/lib/utilidades/crud-service";
import type { BaseDatos, Curso } from "@/lib/supabase/tipos-base-datos";

export function listarCursos(cliente: SupabaseClient<BaseDatos>) {
  return listarRegistros<Curso>(cliente, "cursos", {
    ordenarPor: "creado_en",
    ascendente: false
  });
}

export function crearCurso(cliente: SupabaseClient<BaseDatos>, valores: Record<string, unknown>) {
  return crearRegistro<Curso>(cliente, "cursos", valores);
}

export async function listarCursosOpciones(cliente: SupabaseClient<BaseDatos>) {
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
    .from("cursos")
    .select("id, nombre")
    .order("nombre", { ascending: true });

  return (data ?? []).map((curso) => ({
    valor: curso.id,
    etiqueta: curso.nombre
  }));
}

export function actualizarCurso(
  cliente: SupabaseClient<BaseDatos>,
  id: string,
  valores: Record<string, unknown>
) {
  return actualizarRegistro<Curso>(cliente, "cursos", id, valores);
}

export function desactivarCurso(cliente: SupabaseClient<BaseDatos>, id: string) {
  return desactivarRegistro<Curso>(cliente, "cursos", id, { activo: false });
}

export function activarCurso(cliente: SupabaseClient<BaseDatos>, id: string) {
  return actualizarRegistro<Curso>(cliente, "cursos", id, { activo: true });
}
