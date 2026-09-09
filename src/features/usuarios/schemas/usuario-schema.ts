import { z } from "zod";
import { rolesUsuario } from "@/lib/autenticacion/roles";
import { estadoGeneralSchema, textoOpcional } from "@/lib/validadores/comunes";

export const usuarioSchema = z.object({
  correo: z.string().trim().toLowerCase().email("Ingresa un correo válido."),
  nombres: z.string().trim().min(2, "Ingresa los nombres."),
  apellidos: z.string().trim().min(2, "Ingresa los apellidos."),
  telefono: textoOpcional,
  rol: z.enum(rolesUsuario),
  estado: estadoGeneralSchema,
  foto_url: textoOpcional,
  contrasena: z.string().trim().optional().default("")
});

export const usuarioCrearSchema = usuarioSchema.extend({
  contrasena: z.string().trim().min(8, "La contraseña debe tener al menos 8 caracteres.")
});

export const usuarioActualizarSchema = usuarioSchema.extend({
  contrasena: z
    .union([
      z.literal(""),
      z.string().trim().min(8, "La nueva contraseña debe tener al menos 8 caracteres.")
    ])
    .optional()
    .default("")
});

export type UsuarioValores = z.infer<typeof usuarioSchema>;
export type UsuarioCrearValores = z.infer<typeof usuarioCrearSchema>;
export type UsuarioActualizarValores = z.infer<typeof usuarioActualizarSchema>;
