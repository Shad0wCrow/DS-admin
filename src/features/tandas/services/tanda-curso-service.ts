import type { SupabaseClient } from "@supabase/supabase-js";
import { crearRegistro, eliminarRegistro, listarRegistros } from "@/lib/utilidades/crud-service";
import type { BaseDatos } from "@/lib/supabase/tipos-base-datos";

export type TandaCursoRegistro = {
  id: string;
  tanda_id: string;
  curso_id: string;
};

export function listarTandaCursos(cliente: SupabaseClient<BaseDatos>) {
  return listarRegistros<TandaCursoRegistro>(cliente, "tanda_cursos", {
    columnas: "*",
    ordenarPor: "id",
    ascendente: false
  });
}

export function asignarCursoATanda(cliente: SupabaseClient<BaseDatos>, valores: Record<string, unknown>) {
  return crearRegistro<TandaCursoRegistro>(cliente, "tanda_cursos", valores);
}

export function quitarCursoDeTanda(cliente: SupabaseClient<BaseDatos>, id: string) {
  return eliminarRegistro(cliente, "tanda_cursos", id);
}
