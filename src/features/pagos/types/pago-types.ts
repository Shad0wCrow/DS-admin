import type { PagoDocente } from "@/lib/supabase/tipos-base-datos";
import type { LiquidacionRegistro } from "@/features/liquidaciones/types/liquidacion-types";
import type { PagoDocenteValores } from "@/features/pagos/schemas/pago-schema";

export type PagoDocenteRegistro = PagoDocente & {
  liquidaciones?: LiquidacionRegistro | null;
};
export type PagoDocenteFormulario = PagoDocenteValores;
