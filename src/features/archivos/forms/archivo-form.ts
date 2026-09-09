import type { CampoFormulario } from "@/components/common/formulario-entidad";

export const camposArchivo: CampoFormulario[] = [
  { nombre: "bucket", etiqueta: "Bucket", tipo: "select", opciones: [
    { etiqueta: "Archivos docentes", valor: "archivos_docentes" },
    { etiqueta: "Comprobantes de pago", valor: "comprobantes_pago" }
  ] },
  { nombre: "ruta", etiqueta: "Ruta", tipo: "texto" },
  { nombre: "tipo", etiqueta: "Tipo", tipo: "texto" }
];
