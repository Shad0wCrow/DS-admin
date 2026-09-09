import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/configuracion";
import { realtimeServidor } from "@/lib/supabase/realtime";
import type { BaseDatos } from "@/lib/supabase/tipos-base-datos";

export async function crearClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient<BaseDatos>(supabaseUrl, supabaseAnonKey, {
    realtime: realtimeServidor,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesParaGuardar) {
        try {
          cookiesParaGuardar.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components no siempre pueden persistir cookies; proxy refresca la sesión.
        }
      }
    }
  });
}
