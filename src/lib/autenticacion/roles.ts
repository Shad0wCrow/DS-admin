export const rolesUsuario = ["superadmin", "admin", "docente"] as const;

export type RolUsuario = (typeof rolesUsuario)[number];

export const etiquetasRol: Record<RolUsuario, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  docente: "Docente"
};

export function esRolUsuario(valor: unknown): valor is RolUsuario {
  return typeof valor === "string" && rolesUsuario.includes(valor as RolUsuario);
}
