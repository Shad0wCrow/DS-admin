import { z } from "zod";

export const estadoTandaSchema = z.enum([
  "PLANIFICADA",
  "ABIERTA",
  "CERRADA",
  "CANCELADA",
  "planificada",
  "abierta",
  "cerrada",
  "cancelada"
]);

export const tandaSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa el nombre de la tanda."),
  fecha_inicio: z.string().min(1, "Ingresa la fecha de inicio."),
  fecha_fin: z.string().min(1, "Ingresa la fecha de fin."),
  estado: estadoTandaSchema
});

export type TandaValores = z.infer<typeof tandaSchema>;