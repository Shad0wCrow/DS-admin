import type { SupabaseClient } from "@supabase/supabase-js";
import { actualizarRegistro, crearRegistro, listarRegistros } from "@/lib/utilidades/crud-service";
import type { BaseDatos, Liquidacion, PagoDocente } from "@/lib/supabase/tipos-base-datos";
import type { PagoDocenteRegistro } from "@/features/pagos/types/pago-types";

function redondearMonto(valor: number) {
  return Math.round(valor * 100) / 100;
}

function numeroSeguro(valor: number | string | null | undefined) {
  const numero = Number(valor ?? 0);
  return Number.isFinite(numero) ? numero : 0;
}

export function listarPagosDocentes(cliente: SupabaseClient<BaseDatos>) {
  return listarRegistros<PagoDocenteRegistro>(cliente, "pagos_docentes", {
    columnas: "*, liquidaciones(*, docentes(*, usuarios(*)), tandas(*))",
    ordenarPor: "fecha_pago",
    ascendente: false
  });
}

export async function registrarPagoDocente(
  cliente: SupabaseClient<BaseDatos>,
  valores: Record<string, unknown>
) {
  const liquidacionId = typeof valores.liquidacion_id === "string" ? valores.liquidacion_id : "";

  if (!liquidacionId) {
    return { datos: null, error: "Selecciona una liquidación." };
  }

  const {
    data: { user }
  } = await cliente.auth.getUser();

  if (!user) {
    return { datos: null, error: "Sesión no válida." };
  }

  const { data: liquidacion, error: errorLiquidacion } = await cliente
    .from("liquidaciones")
    .select("*")
    .eq("id", liquidacionId)
    .maybeSingle();

  if (errorLiquidacion) return { datos: null, error: errorLiquidacion.message };
  if (!liquidacion) return { datos: null, error: "No se encontró la liquidación." };

  const liquidacionActual = liquidacion as Liquidacion;
  if (liquidacionActual.estado === "PAGADO") {
    return { datos: null, error: "Esta liquidación ya fue pagada." };
  }

  if (liquidacionActual.estado === "NULL") {
    return { datos: null, error: "No se puede pagar una liquidación anulada." };
  }

  const montoIngresado =
    typeof valores.monto === "number" || typeof valores.monto === "string"
      ? valores.monto
      : null;
  const monto = redondearMonto(numeroSeguro(montoIngresado ?? liquidacionActual.monto_docente));
  if (monto <= 0) return { datos: null, error: "El monto a pagar debe ser mayor a cero." };

  const pago = await crearRegistro<PagoDocente>(cliente, "pagos_docentes", {
    liquidacion_id: liquidacionId,
    monto,
    pagado_por: user.id,
    fecha_pago: new Date().toISOString()
  });

  if (pago.error || !pago.datos) return pago;

  const actualizacion = await actualizarRegistro<Liquidacion>(cliente, "liquidaciones", liquidacionId, {
    estado: "PAGADO"
  });

  if (actualizacion.error) {
    return { datos: pago.datos, error: actualizacion.error };
  }

  return pago;
}
