import type { CampoFormulario } from "@/components/common/formulario-entidad";

export function obtenerCamposCurso(): CampoFormulario[] {
  return [
    { nombre: "nombre", etiqueta: "Nombre", tipo: "texto", placeholder: "React desde cero" },
    { nombre: "duracion", etiqueta: "Duración", tipo: "texto", placeholder: "8 semanas" },
    { nombre: "precio", etiqueta: "Precio", tipo: "numero", placeholder: "1000" },
    {
      nombre: "descripcion",
      etiqueta: "Descripción",
      tipo: "textarea",
      placeholder: "Contenido, objetivos y alcance del curso"
    },
    { nombre: "activo", etiqueta: "Curso activo", tipo: "checkbox" }
  ];
}

export const valoresInicialesCurso = {
  nombre: "",
  descripcion: "",
  duracion: "",
  precio: 0,
  activo: true
};
