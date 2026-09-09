import { z } from "zod";

export const pagoDocenteSchema = z.object({
  liquidacion_id: z.string().uuid("Selecciona una liquidación."),
  monto: z.number().positive("El monto debe ser mayor a cero.")
});

export type PagoDocenteValores = z.infer<typeof pagoDocenteSchema>;
