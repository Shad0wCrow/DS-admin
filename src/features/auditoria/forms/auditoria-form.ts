import type { CampoFormulario } from "@/components/common/formulario-entidad";

export const camposAuditoria: CampoFormulario[] = [
  { nombre: "tabla_afectada", etiqueta: "Tabla", tipo: "texto" },
  { nombre: "accion", etiqueta: "Acción", tipo: "texto" }
];
