import type { CampoFormulario } from "@/components/common/formulario-entidad";

export const camposEstudiante: CampoFormulario[] = [
  { nombre: "nombres", etiqueta: "Nombres", tipo: "texto", placeholder: "María" },
  { nombre: "apellidos", etiqueta: "Apellidos", tipo: "texto", placeholder: "Gómez" },
  { nombre: "correo", etiqueta: "Correo", tipo: "email", placeholder: "estudiante@correo.com" },
  { nombre: "telefono", etiqueta: "Teléfono", tipo: "texto", placeholder: "70000000" },
];

export const valoresInicialesEstudiante = {
  nombres: "",
  apellidos: "",
  correo: "",
  telefono: ""
};
