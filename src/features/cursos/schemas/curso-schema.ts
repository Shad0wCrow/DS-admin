import { z } from "zod";
import { textoOpcional } from "@/lib/validadores/comunes";

export const cursoSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa el nombre del curso."),
  descripcion: textoOpcional,
  duracion: z.string().trim().min(2, "Ingresa la duración."),
  precio: z.coerce.number().positive("El precio debe ser mayor a cero."),
  activo: z.boolean().default(true)
});

export type CursoValores = z.infer<typeof cursoSchema>;
