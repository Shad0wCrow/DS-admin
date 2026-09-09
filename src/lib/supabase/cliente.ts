import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/configuracion";
import type { BaseDatos } from "@/lib/supabase/tipos-base-datos";

let clienteNavegador: ReturnType<typeof createBrowserClient<BaseDatos>> | undefined;

export function crearClienteNavegador() {
  if (!clienteNavegador) {
    clienteNavegador = createBrowserClient<BaseDatos>(supabaseUrl, supabaseAnonKey);
  }
  return clienteNavegador;
}