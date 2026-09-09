import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ShellDashboard } from "@/components/layout/shell-dashboard";
import {
  columnasPerfilActual,
  esUsuarioActivo,
  normalizarPerfilActual
} from "@/lib/autenticacion/perfil";
import { crearClienteAdministrativo } from "@/lib/supabase/admin";
import type { PerfilActual } from "@/features/autenticacion/types/autenticacion-types";

export const dynamic = "force-dynamic";

const obtenerPerfilCached = cache(async (userId: string) => {
  const admin = crearClienteAdministrativo();
  const { data, error } = await admin
    .from("usuarios")
    .select(columnasPerfilActual)
    .eq("id", userId)
    .maybeSingle();

  return { data: data as PerfilActual | null, error };
});

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const listaCabeceras = await headers();
  const userId = listaCabeceras.get("x-user-id");

  if (!userId) {
    redirect("/login");
  }

  const { data, error } = await obtenerPerfilCached(userId);
  const perfil = normalizarPerfilActual(data);

  if (error || !perfil || !esUsuarioActivo(perfil.estado)) {
    redirect("/login?sesion_invalida=1");
  }

  return <ShellDashboard perfilInicial={perfil}>{children}</ShellDashboard>;
}