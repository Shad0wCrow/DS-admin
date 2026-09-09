import type { CampoFormulario } from "@/components/common/formulario-entidad";

export const camposNotificacion: CampoFormulario[] = [
  { nombre: "titulo", etiqueta: "Título", tipo: "texto" },
  { nombre: "mensaje", etiqueta: "Mensaje", tipo: "textarea" },
  { nombre: "usuario_id", etiqueta: "Usuario", tipo: "texto" }
];
