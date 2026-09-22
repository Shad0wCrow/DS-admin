"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Boton } from "@/components/ui/boton";
import { Campo } from "@/components/ui/campo";
import { usarConfiguracion } from "@/features/configuracion/hooks/usar-configuracion";
import {
  configuracionSchema,
  type ConfiguracionValores
} from "@/features/configuracion/schemas/configuracion-schema";

export function ConfiguracionForm() {
  const { configuracion, guardar, refrescar } = usarConfiguracion();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ConfiguracionValores>({
    resolver: zodResolver(configuracionSchema),
    defaultValues: {
      porcentaje_docente: 60,
      porcentaje_empresa: 40
    }
  });

  useEffect(() => {
    if (configuracion) {
      reset({
        porcentaje_docente: configuracion.porcentaje_docente,
        porcentaje_empresa: configuracion.porcentaje_empresa
      });
    }
  }, [configuracion, reset]);

  async function manejarEnvio(valores: ConfiguracionValores) {
    const resultado = await guardar(valores, configuracion?.id);
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }
    toast.success("Configuración actualizada.");
    refrescar();
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(manejarEnvio)}>
      <Campo
        etiqueta="Porcentaje docente"
        type="number"
        step="1"
        error={errors.porcentaje_docente?.message}
        {...register("porcentaje_docente", { valueAsNumber: true })}
      />
      <Campo
        etiqueta="Porcentaje DigitalServices"
        type="number"
        step="1"
        error={errors.porcentaje_empresa?.message}
        {...register("porcentaje_empresa", { valueAsNumber: true })}
      />
      <div className="md:col-span-2">
        <Boton type="submit" cargando={isSubmitting}>
          <Save className="h-4 w-4" />
          Guardar configuración
        </Boton>
      </div>
    </form>
  );
}
