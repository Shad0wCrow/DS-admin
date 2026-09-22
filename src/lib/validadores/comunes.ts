import { z } from "zod";

export const textoOpcional = z.string().nullable().optional();

export const urlOpcional = z
  .union([z.string().url("Ingresa una URL válida."), z.literal(""), z.null()])
  .optional()
  .transform((valor) => (valor === "" ? null : valor));

export const uuidOpcional = z
  .union([z.string().uuid("Selecciona un registro válido."), z.literal(""), z.null()])
  .optional()
  .transform((valor) => (valor === "" ? null : valor));

export const estadoGeneralSchema = z.enum(["activo", "inactivo"]);

export const estadoGeneralOpciones = [
  { etiqueta: "Activo", valor: "activo" },
  { etiqueta: "Inactivo", valor: "inactivo" }
];
