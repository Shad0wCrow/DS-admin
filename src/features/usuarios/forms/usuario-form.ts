import type { CampoFormulario } from "@/components/common/formulario-entidad";
import { estadoGeneralOpciones } from "@/lib/validadores/comunes";

export const rolUsuarioOpciones = [
  { etiqueta: "Superadmin", valor: "superadmin" },
  { etiqueta: "Admin", valor: "admin" },
  { etiqueta: "Docente", valor: "docente" }
];

export const camposUsuario: CampoFormulario[] = [
  { nombre: "nombres", etiqueta: "Nombres", tipo: "texto", placeholder: "Ana" },
  { nombre: "apellidos", etiqueta: "Apellidos", tipo: "texto", placeholder: "Rojas" },
  { nombre: "correo", etiqueta: "Correo", tipo: "email", placeholder: "admin@digitalservices.bo" },
  { nombre: "telefono", etiqueta: "Teléfono", tipo: "texto", placeholder: "70000000" },
  { nombre: "rol", etiqueta: "Rol", tipo: "select", opciones: rolUsuarioOpciones },
  { nombre: "estado", etiqueta: "Estado", tipo: "select", opciones: estadoGeneralOpciones },
  { nombre: "contrasena", etiqueta: "Contraseña", tipo: "password" }
];

export const valoresInicialesUsuario = {
  nombres: "",
  apellidos: "",
  correo: "",
  telefono: "",
  rol: "admin",
  estado: "activo",
  contrasena: ""
};
