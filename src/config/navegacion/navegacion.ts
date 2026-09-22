import {
  Archive,
  Banknote,
  Bell,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  UserRoundCog,
  WalletCards
} from "lucide-react";
import type { Route } from "next";
import type { RolUsuario } from "@/lib/autenticacion/roles";

export type ElementoNavegacion = {
  titulo: string;
  href: Route;
  icono: React.ComponentType<{ className?: string }>;
  roles: RolUsuario[];
};

export const navegacionPrincipal: ElementoNavegacion[] = [
  {
    titulo: "Dashboard",
    href: "/dashboard",
    icono: LayoutDashboard,
    roles: ["superadmin", "admin"]
  },
  {
    titulo: "Usuarios",
    href: "/usuarios",
    icono: UserRoundCog,
    roles: ["superadmin"]
  },
  {
    titulo: "Docentes",
    href: "/docentes",
    icono: GraduationCap,
    roles: ["superadmin"]
  },
  {
    titulo: "Estudiantes",
    href: "/estudiantes",
    icono: Users,
    roles: ["superadmin", "admin", "docente"]
  },
  {
    titulo: "Cursos",
    href: "/cursos",
    icono: BookOpen,
    roles: ["superadmin", "admin"]
  },
  {
    titulo: "Tandas",
    href: "/tandas",
    icono: ClipboardCheck,
    roles: ["superadmin", "admin"]
  },
  {
    titulo: "Inscripciones",
    href: "/inscripciones/registrar",
    icono: CreditCard,
    roles: ["superadmin", "admin", "docente"]
  },
  {
    titulo: "Liquidaciones",
    href: "/liquidaciones",
    icono: WalletCards,
    roles: ["superadmin", "admin"]
  },
  {
    titulo: "Pagos",
    href: "/pagos",
    icono: Banknote,
    roles: ["superadmin", "admin"]
  },
  {
    titulo: "Reportes",
    href: "/reportes",
    icono: FileBarChart,
    roles: ["superadmin", "admin"]
  },
  {
    titulo: "Archivos",
    href: "/archivos",
    icono: Archive,
    roles: ["superadmin"]
  },
  {
    titulo: "Notificaciones",
    href: "/notificaciones",
    icono: Bell,
    roles: ["superadmin"]
  },
  {
    titulo: "Configuración",
    href: "/configuracion",
    icono: Settings,
    roles: ["superadmin"]
  },
  {
    titulo: "Auditoría",
    href: "/auditoria",
    icono: ShieldCheck,
    roles: ["superadmin"]
  }
];

export function obtenerNavegacionPorRol(rol?: string): ElementoNavegacion[] {
  if (!rol) return [];
  const rolLimpio = rol.toLowerCase() as RolUsuario;
  return navegacionPrincipal.filter((item) => item.roles.includes(rolLimpio));
}