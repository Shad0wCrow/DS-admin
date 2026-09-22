import type {
  Docente,
  Liquidacion,
  Tanda,
  Usuario
} from "@/lib/supabase/tipos-base-datos";
import type { LiquidacionValores } from "@/features/liquidaciones/schemas/liquidacion-schema";

export type LiquidacionRegistro = Liquidacion & {
  docentes?: (Docente & { usuarios?: Usuario | null }) | null;
  tandas?: Tanda | null;
};

export type CursoLiquidacionDetalle = {
  curso_id: string;
  curso_nombre: string;
  cantidad_inscritos: number;
  monto_total: number;
  monto_docente: number;
  monto_instituto: number;
};

export type LiquidacionDetalle = {
  liquidacion: LiquidacionRegistro;
  cursos: CursoLiquidacionDetalle[];
  porcentaje_docente: number;
  porcentaje_empresa: number;
  monto_total: number;
  monto_docente: number;
  monto_instituto: number;
  qr_url: string | null;
  qr_error: string | null;
};
export type LiquidacionFormulario = LiquidacionValores;
