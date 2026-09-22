import type { RolUsuario } from "@/lib/autenticacion/roles";

export const rutasPorRol: Record<RolUsuario, string[]> = {
  superadmin: [
    "/dashboard",
    "/usuarios",
    "/docentes",
    "/estudiantes",
    "/cursos",
    "/tandas",
    "/inscripciones",
    "/liquidaciones",
    "/pagos",
    "/reportes",
    "/configuracion",
    "/auditoria",
    "/perfil",
    "/archivos",
    "/notificaciones"
  ],
  admin: [
    "/dashboard",
    "/usuarios",
    "/docentes",
    "/estudiantes",
    "/cursos",
    "/tandas",
    "/inscripciones",
    "/liquidaciones",
    "/pagos",
    "/reportes",
    "/perfil",
  ],
  docente: ["/perfil", "/notificaciones"]
};

export const rutasProtegidas = Array.from(
  new Set(Object.values(rutasPorRol).flat())
).sort((a, b) => b.length - a.length);

export function coincideRuta(rutaActual: string, rutaPermitida: string) {
  return rutaActual === rutaPermitida || rutaActual.startsWith(`${rutaPermitida}/`);
}

export function puedeAccederRuta(rol: RolUsuario | null | undefined, ruta: string) {
  if (!rol) return false;
  return rutasPorRol[rol].some((rutaPermitida) => coincideRuta(ruta, rutaPermitida));
}
