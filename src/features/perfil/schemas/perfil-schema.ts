import { z } from "zod";
import { textoOpcional } from "@/lib/validadores/comunes";

export const perfilSchema = z.object({
  nombres: z.string().trim().min(2, "Ingresa los nombres."),
  apellidos: z.string().trim().min(2, "Ingresa los apellidos."),
  telefono: textoOpcional
});

export const materiaTemarioSchema = z.object({
  materia: z.string().trim().min(2, "Ingresa una materia.")
});

export type PerfilValores = z.infer<typeof perfilSchema>;
export type MateriaTemarioValores = z.infer<typeof materiaTemarioSchema>;
