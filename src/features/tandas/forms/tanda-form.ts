import type { CampoFormulario } from "@/components/common/formulario-entidad";

export const estadoTandaOpciones = [
  { etiqueta: "Planificada", valor: "PLANIFICADA" },
  { etiqueta: "Abierta", valor: "ABIERTA" },
  { etiqueta: "Cerrada", valor: "CERRADA" },
  { etiqueta: "Cancelada", valor: "CANCELADA" }
];

export const camposTanda: CampoFormulario[] = [
  { nombre: "nombre", etiqueta: "Nombre", tipo: "texto", placeholder: "Tanda julio 2026" },
  { nombre: "fecha_inicio", etiqueta: "Fecha inicio", tipo: "fecha" },
  { nombre: "fecha_fin", etiqueta: "Fecha fin", tipo: "fecha" },
  { nombre: "estado", etiqueta: "Estado", tipo: "select", opciones: estadoTandaOpciones }
];

export const valoresInicialesTanda = {
  nombre: "",
  fecha_inicio: "",
  fecha_fin: "",
  estado: "PLANIFICADA"
};