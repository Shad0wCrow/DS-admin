import { z } from "zod";

export const configuracionSchema = z
  .object({
    porcentaje_docente: z.number().min(0).max(100),
    porcentaje_empresa: z.number().min(0).max(100)
  })
  .refine((valores) => valores.porcentaje_docente + valores.porcentaje_empresa === 100, {
    message: "La suma de porcentajes debe ser 100.",
    path: ["porcentaje_empresa"]
  });

export type ConfiguracionValores = z.infer<typeof configuracionSchema>;
