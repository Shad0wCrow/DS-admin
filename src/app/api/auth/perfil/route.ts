import { NextResponse } from "next/server";
import {
  columnasPerfilActual,
  esUsuarioActivo,
  normalizarPerfilActual
} from "@/lib/autenticacion/perfil";
import { crearClienteAdministrativo } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { PerfilActual } from "@/features/autenticacion/types/autenticacion-types";

export async function GET() {
  const supabase = await crearClienteServidor();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }

  const admin = crearClienteAdministrativo();
  const { data, error } = await admin
    .from("usuarios")
    .select(columnasPerfilActual)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "La sesión inició, pero no se pudo validar el perfil en Supabase." },
      { status: 400 }
    );
  }

  const perfil = normalizarPerfilActual(data as PerfilActual | null);

  if (!perfil) {
    return NextResponse.json(
      { error: "La sesión inició, pero este usuario no existe en public.usuarios." },
      { status: 404 }
    );
  }

  if (!esUsuarioActivo(perfil.estado)) {
    return NextResponse.json(
      { error: "Tu usuario está inactivo en public.usuarios." },
      { status: 403 }
    );
  }

  return NextResponse.json({ datos: perfil });
}
