import { z } from "zod";

export const auditoriaFiltroSchema = z.object({
  tabla_afectada: z.string().optional(),
  accion: z.string().optional()
});

export type AuditoriaFiltro = z.infer<typeof auditoriaFiltroSchema>;
