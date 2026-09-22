import { z } from "zod";

export const liquidacionSchema = z.object({
  tanda_id: z.string().uuid("Selecciona una tanda.")
});

export type LiquidacionValores = z.infer<typeof liquidacionSchema>;
