import { z } from "zod";

export const notificacionSchema = z.object({
  titulo: z.string().min(2, "Ingresa el título."),
  mensaje: z.string().min(2, "Ingresa el mensaje."),
  usuario_id: z.string().uuid("Selecciona un usuario.")
});

export type NotificacionValores = z.infer<typeof notificacionSchema>;
