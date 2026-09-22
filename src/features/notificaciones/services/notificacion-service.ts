import type { SupabaseClient } from "@supabase/supabase-js";
import type { BaseDatos } from "@/lib/supabase/tipos-base-datos";
import type { NotificacionRegistro } from "@/features/notificaciones/types/notificacion-types";

type ErrorSupabase = { message: string };
type ConsultaNotificaciones = {
  eq: (columna: string, valor: string | boolean) => ConsultaNotificaciones;
  order: (
    columna: string,
    opciones: { ascending: boolean }
  ) => Promise<{
    data: NotificacionRegistro[] | null;
    count: number | null;
    error: ErrorSupabase | null;
  }>;
};
type TablaNotificaciones = {
  select: (columnas: string, opciones?: { count?: "exact" }) => ConsultaNotificaciones;
  update: (valores: Partial<NotificacionRegistro>) => {
    eq: (columna: string, valor: string) => {
      select: () => { maybeSingle: () => Promise<{ data: NotificacionRegistro | null; error: ErrorSupabase | null }> };
    };
  };
};
type ClienteNotificaciones = {
  from: (tabla: "notificaciones") => TablaNotificaciones;
};

function tablaNotificaciones(cliente: SupabaseClient<BaseDatos>) {
  return (cliente as unknown as ClienteNotificaciones).from("notificaciones");
}

export async function listarNotificaciones(cliente: SupabaseClient<BaseDatos>) {
  try {
    const {
      data: { user }
    } = await cliente.auth.getUser();

    if (!user) return { datos: [], total: 0 };

    const { data, count, error } = await tablaNotificaciones(cliente)
      .select("*", { count: "exact" })
      .eq("usuario_id", user.id)
      .order("creado_en", { ascending: false });

    if (error) throw new Error(error.message);

    return { datos: (data ?? []) as NotificacionRegistro[], total: count ?? 0 };
  } catch (err) {
    console.warn("[notificaciones] Tabla no encontrada o no configurada:", err);
    return { datos: [], total: 0 };
  }
}

export async function marcarNotificacionLeida(cliente: SupabaseClient<BaseDatos>, id: string) {
  const { data, error } = await tablaNotificaciones(cliente)
    .update({ leida: true })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return { datos: null, error: error.message };
  if (!data) {
    return {
      datos: null,
      error: "La notificación se actualizó, pero RLS impidió leer la fila resultante."
    };
  }

  return { datos: data, error: null };
}
