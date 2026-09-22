import type { Docente, Usuario } from "@/lib/supabase/tipos-base-datos";
import type { DocenteValores } from "@/features/docentes/schemas/docente-schema";

export type DocenteRegistro = Docente & {
  usuarios?: Usuario | null;
};
export type DocenteFormulario = DocenteValores;
