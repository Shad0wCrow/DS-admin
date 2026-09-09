const tiposImagenPermitidos = ["image/png", "image/jpeg", "image/webp"];
const tiposComprobantePermitidos = [...tiposImagenPermitidos, "application/pdf"];

export function validarImagen(archivo: File, tamanoMaximoMb = 3) {
  if (!tiposImagenPermitidos.includes(archivo.type)) {
    return "Solo se permiten imágenes PNG, JPG o WEBP.";
  }

  if (archivo.size > tamanoMaximoMb * 1024 * 1024) {
    return `La imagen no puede superar ${tamanoMaximoMb} MB.`;
  }

  return null;
}

export function validarComprobante(archivo: File, tamanoMaximoMb = 5) {
  if (!tiposComprobantePermitidos.includes(archivo.type)) {
    return "Solo se permiten comprobantes en PNG, JPG, WEBP o PDF.";
  }

  if (archivo.size > tamanoMaximoMb * 1024 * 1024) {
    return `El comprobante no puede superar ${tamanoMaximoMb} MB.`;
  }

  return null;
}
