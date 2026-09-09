import type { Docente } from "@/lib/supabase/tipos-base-datos";
import type { MateriaTemarioValores, PerfilValores } from "@/features/perfil/schemas/perfil-schema";

export type PerfilFormulario = PerfilValores;
export type MateriaTemarioFormulario = MateriaTemarioValores;
export type DocentePerfil = Docente;
export type TemarioDocente = {
  id: string;
  docente_id: string;
  materia: string;
  descripcion: string | null;
  creado_en: string;
};
