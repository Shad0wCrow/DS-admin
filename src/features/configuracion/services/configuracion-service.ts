import type { SupabaseClient } from "@supabase/supabase-js";
import {
  actualizarRegistro,
  crearRegistro,
  listarRegistros
} from "@/lib/utilidades/crud-service";
import type { BaseDatos } from "@/lib/supabase/tipos-base-datos";
import type { ConfiguracionRegistro } from "@/features/configuracion/types/configuracion-types";

export async function obtenerConfiguracion(cliente: SupabaseClient<BaseDatos>) {
  const respuesta = await listarRegistros<ConfiguracionRegistro>(
    cliente,
    "configuracion",
    {
      ordenarPor: "actualizado_en",
      ascendente: false
    }
  );
  return respuesta.datos[0] ?? null;
}

export async function guardarConfiguracion(
  cliente: SupabaseClient<BaseDatos>,
  valores: Record<string, unknown>,
  id?: string
) {
  if (id) {
    return actualizarRegistro<ConfiguracionRegistro>(cliente, "configuracion", id, valores);
  }
  return crearRegistro<ConfiguracionRegistro>(cliente, "configuracion", valores);
}