import type { SupabaseClient } from "@supabase/supabase-js";
import {
  actualizarRegistro,
  crearRegistro,
  listarRegistros
} from "@/lib/utilidades/crud-service";
import type { BaseDatos, Estudiante } from "@/lib/supabase/tipos-base-datos";

export function listarEstudiantes(cliente: SupabaseClient<BaseDatos>) {
  return listarRegistros<Estudiante>(cliente, "estudiantes", {
    columnas: "*",
    ordenarPor: "creado_en",
    ascendente: false
  });
}

export function crearEstudiante(cliente: SupabaseClient<BaseDatos>, valores: Record<string, unknown>) {
  return crearRegistro<Estudiante>(cliente, "estudiantes", valores);
}

export function actualizarEstudiante(
  cliente: SupabaseClient<BaseDatos>,
  id: string,
  valores: Record<string, unknown>
) {
  return actualizarRegistro<Estudiante>(cliente, "estudiantes", id, valores);
}

export async function buscarEstudiantesOpciones(
  cliente: SupabaseClient<BaseDatos>,
  busqueda: string
) {
  if (!busqueda || busqueda.trim().length < 3) {
    return [];
  }

  const termino = busqueda.trim();
  const clienteCrud = cliente as unknown as {
    from: (tabla: string) => {
      select: (columnas: string) => {
        or: (filtro: string) => {
          limit: (
            cantidad: number
          ) => Promise<{
            data: Array<{
              id: string;
              nombres: string;
              apellidos: string;
              correo: string | null;
              telefono: string | null;
            }> | null;
          }>;
        };
      };
    };
  };

  const { data } = await clienteCrud
    .from("estudiantes")
    .select("id, nombres, apellidos, correo, telefono")
    .or(`nombres.ilike.%${termino}%,apellidos.ilike.%${termino}%,correo.ilike.%${termino}%,telefono.ilike.%${termino}%`)
    .limit(15);

  return (data ?? []).map((e) => ({
    valor: e.id,
    etiqueta: `${e.nombres} ${e.apellidos}${e.correo ? ` - ${e.correo}` : ""}`
  }));
}
