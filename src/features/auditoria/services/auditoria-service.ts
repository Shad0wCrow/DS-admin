import type { SupabaseClient } from "@supabase/supabase-js";
import { listarRegistros, type OpcionesListado } from "@/lib/utilidades/crud-service";
import type { BaseDatos } from "@/lib/supabase/tipos-base-datos";
import type { AuditoriaRegistro } from "@/features/auditoria/types/auditoria-types";

export function listarAuditoria(
  cliente: SupabaseClient<BaseDatos>,
  opciones: OpcionesListado = {}
) {
  return listarRegistros<AuditoriaRegistro>(cliente, "auditoria", {
    columnas: "*",
    ordenarPor: "fecha",
    ascendente: false,
    limite: 50,
    ...opciones
  });
}
