"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Boton } from "@/components/ui/boton";
import { Campo, Selector } from "@/components/ui/campo";
import { subirArchivo } from "@/features/archivos/services/archivo-service";
import { usarCursos } from "@/features/cursos/hooks/usar-cursos";
import { usarEstudiantes } from "@/features/estudiantes/hooks/usar-estudiantes";
import { usarInscripciones } from "@/features/inscripciones/hooks/usar-inscripciones";
import {
  inscripcionSchema,
  type InscripcionValores
} from "@/features/inscripciones/schemas/inscripcion-schema";
import { usarTandas } from "@/features/tandas/hooks/usar-tandas";
import { validarComprobante } from "@/lib/validadores/archivos";

export function InscripcionForm() {
  const estudiantesHook = usarEstudiantes();
  const cursosHook = usarCursos();
  const tandasHook = usarTandas();
  const inscripcionesHook = usarInscripciones();

  const [archivo, setArchivo] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<InscripcionValores>({
    resolver: zodResolver(inscripcionSchema),
    defaultValues: {
      estudiante_id: "",
      curso_id: "",
      tanda_id: "",
      monto_pagado: 0,
      comprobante_url: null
    }
  });

  async function manejarEnvio(valores: InscripcionValores) {
    let comprobante = valores.comprobante_url ?? null;

    if (archivo) {
      const errorArchivo = validarComprobante(archivo);
      if (errorArchivo) {
        toast.error(errorArchivo);
        return;
      }

      const subida = await subirArchivo("comprobantes_pago", archivo, "inscripciones");
      if (subida.error) {
        toast.error(subida.error);
        return;
      }
      comprobante = subida.ruta;
    }

    const payload = {
      ...valores,
      comprobante_url: comprobante
    };

    const resultado = await inscripcionesHook.registrar(payload);

    if (resultado?.error) {
      toast.error(resultado.error);
      return;
    }

    toast.success("Inscripción registrada.");
    reset();
    setArchivo(null);
    inscripcionesHook.refrescar();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(manejarEnvio)}>
      <div className="grid gap-4 md:grid-cols-2">
        <Selector
          etiqueta="Estudiante"
          error={errors.estudiante_id?.message}
          opciones={[
            { etiqueta: "Seleccionar estudiante", valor: "" },
            ...estudiantesHook.estudiantes.map((estudiante) => ({
              etiqueta:
                `${estudiante.nombres ?? ""} ${estudiante.apellidos ?? ""}`.trim() ||
                "Estudiante sin nombre",
              valor: estudiante.id
            }))
          ]}
          {...register("estudiante_id")}
        />
        <Selector
          etiqueta="Curso"
          error={errors.curso_id?.message}
          opciones={[
            { etiqueta: "Seleccionar curso", valor: "" },
            ...cursosHook.cursos.map((curso) => ({
              etiqueta: curso.nombre ?? "Curso sin nombre",
              valor: curso.id
            }))
          ]}
          {...register("curso_id")}
        />
        <Selector
          etiqueta="Tanda"
          error={errors.tanda_id?.message}
          opciones={[
            { etiqueta: "Seleccionar tanda", valor: "" },
            ...tandasHook.tandas.map((tanda) => ({
              etiqueta: tanda.nombre ?? "Tanda sin nombre",
              valor: tanda.id
            }))
          ]}
          {...register("tanda_id")}
        />
        <Campo
          etiqueta="Monto pagado"
          type="number"
          step="0.01"
          error={errors.monto_pagado?.message}
          {...register("monto_pagado", { valueAsNumber: true })}
        />
        <div className="md:col-span-2">
          <Campo
            etiqueta="Comprobante de pago"
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={(evento) => setArchivo(evento.target.files?.[0] ?? null)}
          />
        </div>
      </div>
      <Boton type="submit" cargando={isSubmitting}>
        <CreditCard className="h-4 w-4" />
        Registrar inscripción
      </Boton>
      {archivo ? (
        <p className="flex items-center gap-2 text-xs text-[var(--color-texto-secundario)]">
          <Upload className="h-3.5 w-3.5" />
          {archivo.name}
        </p>
      ) : null}
    </form>
  );
}
