"use client";
import {
  Ban,
  Calculator,
  CheckCircle2,
  CreditCard,
  Eye,
  QrCode,
  RotateCcw,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EncabezadoPagina } from "@/components/common/encabezado-pagina";
import { EstadoCarga } from "@/components/common/estado-carga";
import { Boton } from "@/components/ui/boton";
import { Selector } from "@/components/ui/campo";
import { Insignia } from "@/components/ui/insignia";
import { Tarjeta } from "@/components/ui/tarjeta";
import { TablaDatos } from "@/components/ui/tabla-datos";
import { usarLiquidaciones } from "@/features/liquidaciones/hooks/usar-liquidaciones";
import type {
  LiquidacionDetalle,
  LiquidacionRegistro
} from "@/features/liquidaciones/types/liquidacion-types";
import { usarPagos } from "@/features/pagos/hooks/usar-pagos";
import { usarTandas } from "@/features/tandas/hooks/usar-tandas";
import type { EstadoLiquidacion, Tanda } from "@/lib/supabase/tipos-base-datos";
import { formatearFechaHora, formatearMoneda } from "@/lib/utilidades/formato";

function obtenerNombreDocente(fila: LiquidacionRegistro) {
  return fila.docentes?.usuarios
    ? `${fila.docentes.usuarios.nombres} ${fila.docentes.usuarios.apellidos}`
    : fila.docente_id;
}

function obtenerEtiquetaEstado(estado: EstadoLiquidacion | null | undefined) {
  if (estado === "PAGADO") return "PAGADO";
  return estado ?? "PENDIENTE";
}

function obtenerTandaActual(tandas: Tanda[]) {
  const abierta = tandas.find((tanda) => String(tanda.estado).toLowerCase() === "abierta");
  if (abierta) return abierta;
  const hoy = new Date();
  const porFecha = tandas.find((tanda) => {
    if (!tanda.fecha_inicio || !tanda.fecha_fin) return false;
    const inicio = new Date(`${tanda.fecha_inicio}T00:00:00`);
    const fin = new Date(`${tanda.fecha_fin}T23:59:59`);
    return hoy >= inicio && hoy <= fin;
  });
  return porFecha ?? tandas[0] ?? null;
}

export function LiquidacionesPanel() {
  const tandasHook = usarTandas();
  const [tandaSeleccionada, setTandaSeleccionada] = useState("");
  const liquidacionesHook = usarLiquidaciones(tandaSeleccionada || undefined);
  const pagosHook = usarPagos();
  const [sincronizando, setSincronizando] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [detalle, setDetalle] = useState<LiquidacionDetalle | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [confirmandoPago, setConfirmandoPago] = useState(false);

  const opcionesTandas = useMemo(
    () => [
      { etiqueta: "Seleccionar tanda", valor: "" },
      ...tandasHook.tandas.map((tanda) => ({
        etiqueta: tanda.nombre,
        valor: tanda.id
      }))
    ],
    [tandasHook.tandas]
  );

  useEffect(() => {
    if (tandaSeleccionada || tandasHook.tandas.length === 0) return;
    setTandaSeleccionada(obtenerTandaActual(tandasHook.tandas)?.id ?? "");
  }, [tandaSeleccionada, tandasHook.tandas]);

  async function manejarSincronizar() {
    if (!tandaSeleccionada) {
      toast.error("Selecciona una tanda.");
      return;
    }
    setSincronizando(true);
    const resultado = await liquidacionesHook.sincronizar(tandaSeleccionada);
    setSincronizando(false);
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }
    const resumen = resultado.datos;
    toast.success(
      resumen
        ? `Liquidaciones listas: ${resumen.generadas} generadas, ${resumen.actualizadas} actualizadas.`
        : "Liquidaciones actualizadas."
    );
    if (resumen?.cursos_sin_docente && resumen.cursos_sin_docente.length > 0) {
      toast.warning(
        `Cursos sin docente asignado (revisa tanda_cursos): ${resumen.cursos_sin_docente.join(", ")}`
      );
    }
    liquidacionesHook.refrescar();
  }

  async function manejarVerDetalle(fila: LiquidacionRegistro) {
    setDetalleAbierto(true);
    setDetalle(null);
    setCargandoDetalle(true);
    const resultado = await liquidacionesHook.obtenerDetalle(fila.id);
    setCargandoDetalle(false);
    if (resultado.error || !resultado.datos) {
      toast.error(resultado.error ?? "No se pudo cargar el detalle.");
      setDetalleAbierto(false);
      return;
    }
    setDetalle(resultado.datos);
  }

  async function manejarConfirmarPago() {
    if (!detalle) return;
    setConfirmandoPago(true);
    const resultado = await pagosHook.confirmar(detalle.liquidacion.id);
    setConfirmandoPago(false);
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }
    toast.success("Pago confirmado.");
    setDetalle((actual) =>
      actual
        ? {
            ...actual,
            liquidacion: {
              ...actual.liquidacion,
              estado: "PAGADO"
            }
          }
        : actual
    );
    liquidacionesHook.refrescar();
    pagosHook.refrescar();
  }

  async function manejarAnular(id: string) {
    const resultado = await liquidacionesHook.anular(id);
    if (resultado?.error) {
      toast.error(resultado.error);
      return;
    }
    toast.success("Liquidación anulada.");
    liquidacionesHook.refrescar();
  }

  const cargandoListado = liquidacionesHook.cargando || tandasHook.cargando;

  return (
    <div className="grid gap-6">
      <EncabezadoPagina
        titulo="Liquidaciones"
        descripcion="Calcula por tanda el 60/40 configurado y confirma pagos manuales con QR."
        acciones={
          <Boton variante="secundario" onClick={liquidacionesHook.refrescar}>
            <RotateCcw className="h-4 w-4" />
            Actualizar
          </Boton>
        }
      />
      <Tarjeta className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <Selector
            etiqueta="Tanda"
            opciones={opcionesTandas}
            value={tandaSeleccionada}
            onChange={(evento) => setTandaSeleccionada(evento.target.value)}
          />
          <Boton
            type="button"
            onClick={manejarSincronizar}
            cargando={sincronizando}
            disabled={!tandaSeleccionada || tandasHook.cargando}
          >
            <Calculator className="h-4 w-4" />
            Calcular liquidaciones
          </Boton>
        </div>
      </Tarjeta>
      {cargandoListado ? (
        <EstadoCarga />
      ) : (
        <TablaDatos
          columnas={[
            {
              clave: "fecha",
              titulo: "Fecha",
              renderizar: (fila: LiquidacionRegistro) => formatearFechaHora(fila.creado_en)
            },
            {
              clave: "docente",
              titulo: "Docente",
              renderizar: obtenerNombreDocente
            },
            {
              clave: "tanda",
              titulo: "Tanda",
              renderizar: (fila: LiquidacionRegistro) => fila.tandas?.nombre ?? "Sin tanda"
            },
            {
              clave: "inscritos",
              titulo: "Inscritos",
              renderizar: (fila: LiquidacionRegistro) => fila.cantidad_inscritos ?? 0
            },
            {
              clave: "monto_total",
              titulo: "Total",
              renderizar: (fila: LiquidacionRegistro) => formatearMoneda(fila.monto_total ?? 0)
            },
            {
              clave: "monto_docente",
              titulo: "Pagado docente",
              renderizar: (fila: LiquidacionRegistro) => formatearMoneda(fila.monto_docente ?? 0)
            },
            {
              clave: "monto_instituto",
              titulo: "Ganancia instituto",
              renderizar: (fila: LiquidacionRegistro) =>
                formatearMoneda(fila.monto_empresa ?? fila.monto_instituto ?? 0)
            },
            {
              clave: "estado",
              titulo: "Estado",
              renderizar: (fila: LiquidacionRegistro) => (
                <Insignia
                  tono={
                    !fila.estado
                      ? "peligro"
                      : fila.estado === "PAGADO"
                        ? "exito"
                        : "neutro"
                  }
                >
                  {obtenerEtiquetaEstado(fila.estado)}
                </Insignia>
              )
            },
            {
              clave: "acciones",
              titulo: "Acciones",
              renderizar: (fila: LiquidacionRegistro) => (
                <div className="flex items-center gap-2">
                  <Boton
                    type="button"
                    variante="secundario"
                    className="h-8 px-2 text-xs"
                    onClick={() => manejarVerDetalle(fila)}
                  >
                    {fila.estado === "PENDIENTE" ? (
                      <CreditCard className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    {fila.estado === "PENDIENTE" ? "Pagar" : "Ver detalle"}
                  </Boton>
                  {fila.estado === "PENDIENTE" ? (
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-borde)] text-[var(--color-peligro)] hover:bg-[var(--color-panel-suave)]"
                      title="Anular"
                      aria-label="Anular"
                      onClick={() => manejarAnular(fila.id)}
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              )
            }
          ]}
          datos={liquidacionesHook.liquidaciones}
          obtenerClave={(fila: LiquidacionRegistro) => fila.id}
          vacio="Sin liquidaciones para la tanda seleccionada"
        />
      )}
      {detalleAbierto ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-[var(--color-borde)] bg-[var(--color-panel)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-borde)] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-texto)]">
                  Pago a docente
                </h2>
                <p className="text-sm text-[var(--color-texto-secundario)]">
                  {detalle ? obtenerNombreDocente(detalle.liquidacion) : "Cargando detalle"}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-borde)] hover:bg-[var(--color-panel-suave)]"
                title="Cerrar"
                aria-label="Cerrar"
                onClick={() => setDetalleAbierto(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {cargandoDetalle ? (
              <div className="p-6">
                <EstadoCarga />
              </div>
            ) : detalle ? (
              <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                <section className="grid gap-4">
                  <div>
                    <p className="text-xs uppercase text-[var(--color-texto-secundario)]">
                      Desglose por curso
                    </p>
                    <div className="mt-3 grid gap-2">
                      {detalle.cursos.length > 0 ? (
                        detalle.cursos.map((curso) => (
                          <div
                            key={curso.curso_id}
                            className="flex items-center justify-between gap-4 rounded-md border border-[var(--color-borde)] px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[var(--color-texto)]">
                                Curso: {curso.curso_nombre}
                              </p>
                              <p className="text-xs text-[var(--color-texto-secundario)]">
                                {curso.cantidad_inscritos} inscritos
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-[var(--color-texto)]">
                              {formatearMoneda(curso.monto_total)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="rounded-md border border-[var(--color-borde)] px-3 py-4 text-sm text-[var(--color-texto-secundario)]">
                          Sin cursos liquidables para este docente en la tanda.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-3 rounded-md bg-[var(--color-panel-suave)] p-4">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[var(--color-texto-secundario)]">Total cobrado</span>
                      <strong className="text-[var(--color-texto)]">
                        {formatearMoneda(detalle.monto_total)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[var(--color-texto-secundario)]">
                        Pagado docente ({detalle.porcentaje_docente}%)
                      </span>
                      <strong className="text-[var(--color-exito)]">
                        {formatearMoneda(detalle.monto_docente)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[var(--color-texto-secundario)]">
                        Ganancia instituto ({detalle.porcentaje_empresa}%)
                      </span>
                      <strong className="text-[var(--color-texto)]">
                        {formatearMoneda(detalle.monto_instituto)}
                      </strong>
                    </div>
                  </div>
                </section>
                <aside className="grid gap-4">
                  <div>
                    <p className="text-xs uppercase text-[var(--color-texto-secundario)]">
                      QR de pago
                    </p>
                    <div className="mt-3 grid min-h-72 place-items-center rounded-md border border-[var(--color-borde)] bg-[var(--color-panel-suave)] p-4">
                      {detalle.qr_url ? (
                        <img
                          src={detalle.qr_url}
                          alt="QR de pago del docente"
                          className="max-h-72 w-full object-contain"
                        />
                      ) : (
                        <div className="grid justify-items-center gap-2 text-center text-sm text-[var(--color-texto-secundario)]">
                          <QrCode className="h-10 w-10" />
                          <p>{detalle.qr_error ?? "El docente no tiene QR cargado."}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {detalle.liquidacion.estado === "PENDIENTE" ? (
                      <Boton
                        type="button"
                        onClick={manejarConfirmarPago}
                        cargando={confirmandoPago}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Confirmar pago
                      </Boton>
                    ) : (
                      <Insignia tono="exito">Pago confirmado</Insignia>
                    )}
                    <Boton
                      type="button"
                      variante="secundario"
                      onClick={() => setDetalleAbierto(false)}
                    >
                      Cerrar
                    </Boton>
                  </div>
                </aside>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}