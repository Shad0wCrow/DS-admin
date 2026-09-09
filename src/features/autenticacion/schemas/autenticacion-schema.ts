import { z } from "zod";

export const loginSchema = z.object({
  correo: z.string().trim().email("Ingresa un correo válido."),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.")
});

export const recuperarContrasenaSchema = z.object({
  correo: z.string().trim().email("Ingresa un correo válido.")
});

export type LoginValores = z.infer<typeof loginSchema>;
export type RecuperarContrasenaValores = z.infer<typeof recuperarContrasenaSchema>;
