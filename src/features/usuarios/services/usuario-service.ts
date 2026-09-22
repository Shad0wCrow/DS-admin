import type { SupabaseClient } from "@supabase/supabase-js";
import type { BaseDatos, EstadoGeneral, Usuario } from "@/lib/supabase/tipos-base-datos";
import type { RolUsuario } from "@/lib/autenticacion/roles";

export type ParametrosListarUsuarios = {
  busqueda?: string;
  rol?: RolUsuario | "todos";
  estado?: EstadoGeneral | "todos";
  pagina?: number;
  limite?: number;
};

export type RespuestaUsuariosPaginada = {
  datos: Usuario[];
  total: number;
};

export async function listarUsuarios(
  _cliente: SupabaseClient<BaseDatos>,
  parametros: ParametrosListarUsuarios = {}
): Promise<RespuestaUsuariosPaginada> {
  const { busqueda = "", rol = "todos", estado = "todos", pagina = 1, limite = 20 } = parametros;
  const params = new URLSearchParams();

  if (busqueda.trim()) {
    params.set("q", busqueda.trim());
  }
  if (rol !== "todos") {
    params.set("rol", rol);
  }
  if (estado !== "todos") {
    params.set("estado", estado);
  }
  params.set("page", pagina.toString());
  params.set("limit", limite.toString());

  const respuesta = await fetch(`/api/usuarios?${params.toString()}`, {
    cache: "no-store"
  });

  const cuerpo = (await respuesta.json()) as {
    datos?: Usuario[];
    total?: number;
    error?: string;
  };

  if (!respuesta.ok) {
    throw new Error(cuerpo.error ?? "No se pudo listar usuarios.");
  }

  return {
    datos: cuerpo.datos ?? [],
    total: cuerpo.total ?? 0
  };
}

export async function crearUsuario(
  _cliente: SupabaseClient<BaseDatos>,
  valores: Record<string, unknown>
) {
  const respuesta = await fetch("/api/usuarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(valores)
  });

  const cuerpo = (await respuesta.json()) as { datos?: Usuario; error?: string };

  if (!respuesta.ok) {
    return { datos: null, error: cuerpo.error ?? "No se pudo crear el usuario." };
  }

  return { datos: cuerpo.datos ?? null, error: null };
}

export async function actualizarUsuario(
  _cliente: SupabaseClient<BaseDatos>,
  id: string,
  valores: Record<string, unknown>
) {
  const respuesta = await fetch("/api/usuarios", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ...valores, id })
  });

  const cuerpo = (await respuesta.json()) as { datos?: Usuario; error?: string };

  if (!respuesta.ok) {
    return { datos: null, error: cuerpo.error ?? "No se pudo actualizar el usuario." };
  }

  return { datos: cuerpo.datos ?? null, error: null };
}

export function cambiarEstadoUsuario(
  cliente: SupabaseClient<BaseDatos>,
  id: string,
  estado: EstadoGeneral
) {
  return actualizarUsuario(cliente, id, { estado });
}

export function desactivarUsuario(cliente: SupabaseClient<BaseDatos>, id: string) {
  return cambiarEstadoUsuario(cliente, id, "inactivo");
}

export function activarUsuario(cliente: SupabaseClient<BaseDatos>, id: string) {
  return cambiarEstadoUsuario(cliente, id, "activo");
}
