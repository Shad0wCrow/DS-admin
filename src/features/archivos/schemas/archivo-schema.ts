import { z } from "zod";

export const archivoSchema = z.object({
  bucket: z.enum(["archivos_docentes", "comprobantes_pago"]),
  ruta: z.string().min(1, "La ruta del archivo es obligatoria."),
  tipo: z.string().min(1, "El tipo de archivo es obligatorio.")
});

export type ArchivoValores = z.infer<typeof archivoSchema>;
