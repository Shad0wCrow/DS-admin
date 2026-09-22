import type { PerfilActual } from "@/features/autenticacion/types/autenticacion-types";
import type { RolUsuario } from "@/lib/autenticacion/roles";
import type { EstadoGeneral, Usuario } from "@/lib/supabase/tipos-base-datos";

export const columnasPerfilActual = "id, correo, nombres, apellidos, telefono, rol, estado";

const rolesNormalizados: Record<string, RolUsuario> = {
  superadmin: "superadmin",
  admin: "admin",
  docente: "docente",
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  DOCENTE: "docente"
};

const estadosNormalizados: Record<string, EstadoGeneral> = {
  activo: "activo",
  inactivo: "inactivo",
  ACTIVO: "activo",
  INACTIVO: "inactivo"
};

export function normalizarRolUsuario(valor: unknown): RolUsuario | null {
  return typeof valor === "string" ? rolesNormalizados[valor] ?? null : null;
}

export function normalizarEstadoUsuario(valor: unknown): EstadoGeneral | null {
  return typeof valor === "string" ? estadosNormalizados[valor] ?? null : null;
}

export function esUsuarioActivo(valor: unknown) {
  return normalizarEstadoUsuario(valor) === "activo";
}

export function normalizarPerfilUsuario<T extends Pick<Usuario, "rol" | "estado">>(
  usuario: T | null | undefined
): (Omit<T, "rol" | "estado"> & { rol: RolUsuario; estado: EstadoGeneral }) | null {
  if (!usuario) return null;

  const rol = normalizarRolUsuario(usuario.rol);
  const estado = normalizarEstadoUsuario(usuario.estado);

  if (!rol || !estado) return null;

  return {
    ...usuario,
    rol,
    estado
  };
}

export function normalizarPerfilActual(perfil: PerfilActual | null | undefined) {
  return normalizarPerfilUsuario(perfil);
}

export function convertirEnumsUsuarioAMayusculas<T extends Record<string, unknown>>(valores: T): T {
  return {
    ...valores,
    ...(typeof valores.rol === "string" ? { rol: valores.rol.toUpperCase() } : {}),
    ...(typeof valores.estado === "string" ? { estado: valores.estado.toUpperCase() } : {})
  };
}

export function esErrorEnumInvalido(error: { code?: string; message?: string } | null | undefined) {
  return (
    error?.code === "22P02" ||
    Boolean(error?.message?.toLowerCase().includes("invalid input value for enum"))
  );
}
