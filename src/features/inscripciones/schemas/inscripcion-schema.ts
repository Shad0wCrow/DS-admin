import { z } from "zod";

export const inscripcionSchema = z.object({
  estudiante_id: z.string().uuid("Selecciona un estudiante."),
  curso_id: z.string().uuid("Selecciona un curso."),
  tanda_id: z.string().uuid("Selecciona una tanda."),
  monto_pagado: z.number().positive("El monto pagado debe ser mayor a cero."),
  comprobante_url: z.string().nullable().optional()
});

export type InscripcionValores = z.infer<typeof inscripcionSchema>;
