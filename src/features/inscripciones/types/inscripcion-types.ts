import type {
  Curso,
  Estudiante,
  Inscripcion,
  Tanda
} from "@/lib/supabase/tipos-base-datos";
import type { InscripcionValores } from "@/features/inscripciones/schemas/inscripcion-schema";

export type InscripcionRegistro = Inscripcion & {
  estudiantes?: Pick<Estudiante, "id" | "nombres" | "apellidos"> | null;
  cursos?: Pick<Curso, "id" | "nombre"> | null;
  tandas?: Pick<Tanda, "id" | "nombre"> | null;
};
export type InscripcionFormulario = InscripcionValores;
