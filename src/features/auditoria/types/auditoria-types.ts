import type { Json } from "@/lib/supabase/tipos-base-datos";

export type AuditoriaRegistro = {
  id: string;
  usuario_id: string | null;
  accion: string;
  tabla_afectada: string;
  registro_id: string | null;
  datos_anteriores: Json | null;
  datos_nuevos: Json | null;
  fecha: string;
};
