import type { Usuario } from "@/lib/supabase/tipos-base-datos";

export type PerfilActual = Pick<
  Usuario,
  "id" | "correo" | "nombres" | "apellidos" | "telefono" | "rol" | "estado"
>;

export type ResultadoAutenticacion = {
  error: string | null;
};
