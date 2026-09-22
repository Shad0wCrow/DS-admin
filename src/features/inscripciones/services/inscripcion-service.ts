import type { SupabaseClient } from "@supabase/supabase-js";
import { crearRegistro, listarRegistros } from "@/lib/utilidades/crud-service";
import type { BaseDatos, Inscripcion } from "@/lib/supabase/tipos-base-datos";
import type { InscripcionRegistro } from "@/features/inscripciones/types/inscripcion-types";

export function listarInscripciones(cliente: SupabaseClient<BaseDatos>) {
  return listarRegistros<InscripcionRegistro>(cliente, "inscripciones", {
    columnas: "*, estudiantes(id, nombres, apellidos), cursos(id, nombre), tandas(id, nombre)",
    ordenarPor: "creado_en",
    ascendente: false
  });
}

export function registrarInscripcion(
  cliente: SupabaseClient<BaseDatos>,
  valores: Record<string, unknown>
) {
  return crearRegistro<Inscripcion>(cliente, "inscripciones", valores);
}
