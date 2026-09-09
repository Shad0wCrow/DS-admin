import { z } from "zod";
export const tandaCursoSchema = z.object({
  tanda_id: z.string().uuid("Selecciona una tanda."),
  curso_id: z.string().uuid("Selecciona un curso."),
  docente_id: z.string().uuid("Selecciona un docente.")
});
export type TandaCursoValores = z.infer<typeof tandaCursoSchema>;