import type { CampoFormulario } from "@/components/common/formulario-entidad";

export function obtenerCamposDocente(
  opcionesUsuarios: Array<{ etiqueta: string; valor: string }>
): CampoFormulario[] {
  return [
    {
      nombre: "usuario_id",
      etiqueta: "Usuario vinculado",
      tipo: "select",
      opciones: [{ etiqueta: "Seleccionar usuario", valor: "" }, ...opcionesUsuarios]
    },
    {
      nombre: "foto_url",
      etiqueta: "Fotografía",
      tipo: "archivo",
      accept: "image/png,image/jpeg,image/webp"
    },
    {
      nombre: "qr_url",
      etiqueta: "QR de pago",
      tipo: "archivo",
      accept: "image/png,image/jpeg,image/webp"
    }
  ];
}

export const valoresInicialesDocente = {
  usuario_id: "",
  foto_url: "",
  qr_url: ""
};
