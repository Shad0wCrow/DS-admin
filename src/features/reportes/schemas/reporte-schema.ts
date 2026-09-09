import { z } from "zod";

export const reporteFiltroSchema = z.object({
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional()
});

export type ReporteFiltro = z.infer<typeof reporteFiltroSchema>;
