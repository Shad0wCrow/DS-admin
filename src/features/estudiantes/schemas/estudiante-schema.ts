import { z } from "zod";
import { textoOpcional } from "@/lib/validadores/comunes";

export const estudianteSchema = z.object({
  nombres: z.string().trim().min(2, "Ingresa los nombres."),
  apellidos: z.string().trim().min(2, "Ingresa los apellidos."),
  correo: textoOpcional,
  telefono: textoOpcional
});

export type EstudianteValores = z.infer<typeof estudianteSchema>;
