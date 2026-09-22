"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { type Resolver, useForm } from "react-hook-form";
import type { ZodType } from "zod";
import { Boton } from "@/components/ui/boton";
import { AreaTexto, Campo, Selector } from "@/components/ui/campo";

type EsquemaResolver = Parameters<typeof zodResolver>[0];

export type CampoFormulario = {
  nombre: string;
  etiqueta: string;
  tipo:
    | "texto"
    | "email"
    | "password"
    | "numero"
    | "fecha"
    | "textarea"
    | "select"
    | "archivo"
    | "checkbox";
  placeholder?: string;
  opciones?: Array<{ etiqueta: string; valor: string }>;
  accept?: string;
  requerido?: boolean;
};

type FormularioEntidadProps = {
  esquema: ZodType<Record<string, unknown>>;
  campos: CampoFormulario[];
  valoresIniciales: Record<string, unknown>;
  textoBoton?: string;
  enviando?: boolean;
  onSubmit: (valores: Record<string, unknown>) => Promise<void> | void;
};

export function FormularioEntidad({
  esquema,
  campos,
  valoresIniciales,
  textoBoton = "Guardar",
  enviando = false,
  onSubmit
}: FormularioEntidadProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(esquema as EsquemaResolver) as Resolver<Record<string, unknown>>,
    defaultValues: valoresIniciales
  });

  useEffect(() => {
    reset(valoresIniciales);
  }, [reset, valoresIniciales]);

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        {campos.map((campo) => {
          const error = errors[campo.nombre]?.message?.toString();

          if (campo.tipo === "textarea") {
            return (
              <div key={campo.nombre} className="md:col-span-2">
                <AreaTexto
                  etiqueta={campo.etiqueta}
                  placeholder={campo.placeholder}
                  error={error}
                  {...register(campo.nombre)}
                />
              </div>
            );
          }

          if (campo.tipo === "select") {
            return (
              <Selector
                key={campo.nombre}
                etiqueta={campo.etiqueta}
                opciones={campo.opciones ?? []}
                error={error}
                {...register(campo.nombre)}
              />
            );
          }

          if (campo.tipo === "archivo") {
            return (
              <Campo
                key={campo.nombre}
                etiqueta={campo.etiqueta}
                type="file"
                accept={campo.accept}
                error={error}
                {...register(campo.nombre)}
              />
            );
          }

          if (campo.tipo === "checkbox") {
            return (
              <label
                key={campo.nombre}
                className="flex h-10 items-center gap-3 self-end rounded-md border border-[var(--color-borde)] bg-[var(--color-panel)] px-3 text-sm text-[var(--color-texto)]"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--color-borde)]"
                  {...register(campo.nombre)}
                />
                <span className="font-medium">{campo.etiqueta}</span>
                {error ? <span className="ml-auto text-xs text-[var(--color-peligro)]">{error}</span> : null}
              </label>
            );
          }

          const tipoInput =
            campo.tipo === "numero"
              ? "number"
              : campo.tipo === "fecha"
                ? "date"
                : campo.tipo === "email"
                  ? "email"
                  : campo.tipo === "password"
                    ? "password"
                    : "text";

          return (
            <Campo
              key={campo.nombre}
              etiqueta={campo.etiqueta}
              type={tipoInput}
              placeholder={campo.placeholder}
              error={error}
              step={campo.tipo === "numero" ? "0.01" : undefined}
              {...register(campo.nombre, {
                valueAsNumber: campo.tipo === "numero"
              })}
            />
          );
        })}
      </div>
      <Boton type="submit" cargando={isSubmitting || enviando} className="w-full md:w-max">
        <Save className="h-4 w-4" />
        {textoBoton}
      </Boton>
    </form>
  );
}
