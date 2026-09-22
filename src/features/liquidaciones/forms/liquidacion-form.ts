import type { CampoFormulario } from "@/components/common/formulario-entidad";

export const estadoLiquidacionOpciones = [
  { etiqueta: "PENDIENTE", valor: "PENDIENTE" },
  { etiqueta: "PAGADO", valor: "PAGADO" },
  { etiqueta: "ANULADA", valor: "NULL" }
];

export const camposLiquidacion: CampoFormulario[] = [
  { nombre: "tanda_id", etiqueta: "Tanda", tipo: "select", opciones: [] }
];
