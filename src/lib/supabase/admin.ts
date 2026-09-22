import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/configuracion";
import { realtimeServidor } from "@/lib/supabase/realtime";
import type { BaseDatos } from "@/lib/supabase/tipos-base-datos";

type ErrorConsulta = {
  code?: string;
  message: string;
};

type RespuestaUnica = Promise<{ data: unknown | null; error: ErrorConsulta | null }>;
type RespuestaLista = Promise<{ data: unknown[] | null; error: ErrorConsulta | null }>;

type ConsultaSeleccion = {
  eq(columna: string, valor: string): ConsultaSeleccion;
  neq(columna: string, valor: string): ConsultaSeleccion;
  order(columna: string, opciones: { ascending: boolean }): RespuestaLista;
  maybeSingle(): RespuestaUnica;
};

type ConsultaEscritura = {
  select(columnas?: string): {
    maybeSingle(): RespuestaUnica;
  };
};

type ConsultaActualizacion = {
  eq(columna: string, valor: string): ConsultaEscritura;
};

type ConsultaTabla = {
  select(columnas?: string): ConsultaSeleccion;
  insert(valores: Record<string, unknown>): ConsultaEscritura;
  update(valores: Record<string, unknown>): ConsultaActualizacion;
};

export type ClienteAdministrativo = Omit<SupabaseClient<BaseDatos>, "from"> & {
  from(tabla: string): ConsultaTabla;
};

export function crearClienteAdministrativo(): ClienteAdministrativo {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor.");
  }

  return createClient<BaseDatos>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    realtime: realtimeServidor
  }) as unknown as ClienteAdministrativo;
}
