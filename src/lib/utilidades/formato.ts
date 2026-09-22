import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatearMoneda(valor: number | string | null | undefined) {
  const numero = Number(valor ?? 0);
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    maximumFractionDigits: 2
  }).format(Number.isFinite(numero) ? numero : 0);
}

export function formatearFecha(fecha: string | null | undefined) {
  if (!fecha) return "Sin fecha";
  return format(new Date(fecha), "dd MMM yyyy", { locale: es });
}

export function formatearFechaHora(fecha: string | null | undefined) {
  if (!fecha) return "Sin fecha";
  return format(new Date(fecha), "dd MMM yyyy, HH:mm", { locale: es });
}
