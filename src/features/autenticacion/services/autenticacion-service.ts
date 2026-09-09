"use client";

import { crearClienteNavegador } from "@/lib/supabase/cliente";
import { urlAplicacion } from "@/lib/supabase/configuracion";
import type { PerfilActual, ResultadoAutenticacion } from "@/features/autenticacion/types/autenticacion-types";
import type { LoginValores, RecuperarContrasenaValores } from "@/features/autenticacion/schemas/autenticacion-schema";

type RespuestaPerfil = {
  datos?: PerfilActual;
  error?: string;
};

export async function iniciarSesion(valores: LoginValores): Promise<ResultadoAutenticacion> {
  const supabase = crearClienteNavegador();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: valores.correo.trim().toLowerCase(),
    password: valores.contrasena
  });

  if (error) {
    return {
      error:
        "No se pudo iniciar sesión. Verifica el correo, la contraseña o la confirmación del usuario."
    };
  }

  if (!data.user) {
    return { error: "No se pudo validar la sesión." };
  }

  const respuestaPerfil = await fetch("/api/auth/perfil", {
    cache: "no-store"
  });
  const cuerpoPerfil = (await respuestaPerfil.json()) as RespuestaPerfil;

  if (!respuestaPerfil.ok) {
    await supabase.auth.signOut();
    return {
      error: cuerpoPerfil.error ?? "La sesión inició, pero no se pudo validar el perfil en Supabase."
    };
  }

  return { error: null };
}

export async function recuperarContrasena(
  valores: RecuperarContrasenaValores
): Promise<ResultadoAutenticacion> {
  const supabase = crearClienteNavegador();
  const { error } = await supabase.auth.resetPasswordForEmail(valores.correo, {
    redirectTo: `${urlAplicacion}/login`
  });

  if (error) {
    return { error: "No se pudo enviar el correo de recuperación." };
  }

  return { error: null };
}

export async function cerrarSesion(): Promise<ResultadoAutenticacion> {
  const supabase = crearClienteNavegador();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: "No se pudo cerrar la sesión." };
  }

  return { error: null };
}

export async function obtenerPerfilActual(): Promise<PerfilActual | null> {
  const respuesta = await fetch("/api/auth/perfil", {
    cache: "no-store"
  });

  if (respuesta.status === 401) return null;

  const cuerpo = (await respuesta.json()) as RespuestaPerfil;

  if (!respuesta.ok) {
    throw new Error("No se pudo obtener el perfil actual.");
  }

  return cuerpo.datos ?? null;
}
