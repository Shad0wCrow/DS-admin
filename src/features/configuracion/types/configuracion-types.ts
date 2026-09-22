import type { ConfiguracionValores } from "@/features/configuracion/schemas/configuracion-schema";

export type ConfiguracionRegistro = ConfiguracionValores & {
  id: string;
  actualizado_por: string | null;
  actualizado_en: string;
};
