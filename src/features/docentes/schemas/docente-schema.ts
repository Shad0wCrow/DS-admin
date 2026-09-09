import { z } from "zod";

export const docenteSchema = z.object({
  usuario_id: z.string().uuid("Selecciona un usuario."),
  foto_url: z.unknown().optional(),
  qr_url: z.unknown().optional()
});

export type DocenteValores = z.infer<typeof docenteSchema>;
