"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Boton } from "@/components/ui/boton";
import { Campo, Selector } from "@/components/ui/campo";
import { usarLiquidaciones } from "@/features/liquidaciones/hooks/usar-liquidaciones";
import { usarPagos } from "@/features/pagos/hooks/usar-pagos";
import { pagoDocenteSchema, type PagoDocenteValores } from "@/features/pagos/schemas/pago-schema";
import { formatearMoneda } from "@/lib/utilidades/formato";

export function PagoForm() {
  const pagos = usarPagos();
  const liquidaciones = usarLiquidaciones();
  const pendientes = liquidaciones.liquidaciones.filter((liquidacion) => liquidacion.estado === "PENDIENTE");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting }
  } = useForm<PagoDocenteValores>({
    resolver: zodResolver(pagoDocenteSchema),
    defaultValues: {
      liquidacion_id: "",
      monto: 0
    }
  });

  const liquidacionId = useWatch({ control, name: "liquidacion_id" });
  const liquidacionSeleccionada = pendientes.find((liquidacion) => liquidacion.id === liquidacionId);

  async function manejarEnvio(valores: PagoDocenteValores) {
    const resultado = await pagos.registrar(valores);
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }
    toast.success("Pago registrado.");
    reset();
    pagos.refrescar();
    liquidaciones.refrescar();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(manejarEnvio)}>
      <Selector
        etiqueta="Liquidación"
        error={errors.liquidacion_id?.message}
        opciones={[
          { etiqueta: "Seleccionar liquidación", valor: "" },
          ...pendientes.map((liquidacion) => ({
            etiqueta: `${formatearMoneda(liquidacion.monto_docente)} - ${
              liquidacion.docentes?.usuarios
                ? `${liquidacion.docentes.usuarios.nombres} ${liquidacion.docentes.usuarios.apellidos}`
                : liquidacion.docente_id
            }`,
            valor: liquidacion.id
          }))
        ]}
        {...register("liquidacion_id", {
          onChange: (evento) => {
            const liquidacion = pendientes.find((item) => item.id === evento.target.value);
            setValue("monto", liquidacion?.monto_docente ?? 0);
          }
        })}
      />
      <Campo
        etiqueta="Monto"
        type="number"
        step="0.01"
        error={errors.monto?.message}
        {...register("monto", { valueAsNumber: true })}
      />
      {liquidacionSeleccionada ? (
        <p className="text-sm text-[var(--color-texto-secundario)]">
          Monto empresa:{" "}
          {formatearMoneda(
            liquidacionSeleccionada.monto_empresa ?? liquidacionSeleccionada.monto_instituto
          )}
        </p>
      ) : null}
      <Boton type="submit" cargando={isSubmitting}>
        <Banknote className="h-4 w-4" />
        Registrar pago
      </Boton>
    </form>
  );
}
