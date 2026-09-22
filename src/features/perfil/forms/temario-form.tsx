"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileUp, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Boton } from "@/components/ui/boton";
import { Campo } from "@/components/ui/campo";
import { Tarjeta } from "@/components/ui/tarjeta";
import { usarPerfilDocente } from "@/features/perfil/hooks/usar-perfil";
import {
  materiaTemarioSchema,
  type MateriaTemarioValores
} from "@/features/perfil/schemas/perfil-schema";

export function TemarioForm() {
  const perfil = usarPerfilDocente();
  const [archivoMarkdown, setArchivoMarkdown] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<MateriaTemarioValores>({
    resolver: zodResolver(materiaTemarioSchema),
    defaultValues: {
      materia: ""
    }
  });

  if (!perfil.docente) return null;

  async function manejarEnvio(valores: MateriaTemarioValores) {
    if (!perfil.docente) return;

    if (!archivoMarkdown) {
      toast.error("Selecciona un archivo Markdown.");
      return;
    }
    if (!archivoMarkdown.name.toLowerCase().endsWith(".md")) {
      toast.error("El temario debe ser un archivo .md.");
      return;
    }

    const descripcion = await archivoMarkdown.text();
    if (!descripcion.trim()) {
      toast.error("El archivo Markdown está vacío.");
      return;
    }

    const materiaExistente = perfil.temario.find(
      (temario) => temario.materia.trim().toLowerCase() === valores.materia.trim().toLowerCase()
    );
    const payload = {
      docente_id: perfil.docente.id,
      materia: valores.materia,
      descripcion
    };
    const resultado = materiaExistente
      ? await perfil.actualizarMateria(materiaExistente.id, payload)
      : await perfil.agregarMateria(payload);

    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }
    toast.success(materiaExistente ? "Temario actualizado." : "Temario agregado.");
    reset();
    setArchivoMarkdown(null);
    perfil.refrescar();
  }

  async function manejarEliminar(id: string) {
    const resultado = await perfil.eliminarMateria(id);
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }
    toast.success("Materia eliminada.");
    perfil.refrescar();
  }

  return (
    <div className="grid gap-4">
      <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit(manejarEnvio)}>
        <div className="flex-1">
          <Campo etiqueta="Materia" error={errors.materia?.message} {...register("materia")} />
        </div>
        <Campo
          etiqueta="Archivo Markdown"
          type="file"
          accept=".md,text/markdown,text/plain"
          onChange={(evento) => setArchivoMarkdown(evento.target.files?.[0] ?? null)}
        />
        <Boton type="submit" cargando={isSubmitting} className="md:mt-7">
          <FileUp className="h-4 w-4" />
          Guardar
        </Boton>
      </form>
      <div className="grid gap-2">
        {perfil.temario.map((materia) => (
          <Tarjeta key={materia.id} className="flex items-start justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-texto)]">{materia.materia}</p>
              <p className="mt-1 line-clamp-2 text-xs text-[var(--color-texto-secundario)]">
                {materia.descripcion ?? "Sin contenido Markdown"}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-borde)] text-[var(--color-peligro)] hover:bg-[var(--color-panel-suave)]"
              title="Eliminar materia"
              aria-label="Eliminar materia"
              onClick={() => manejarEliminar(materia.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </Tarjeta>
        ))}
      </div>
    </div>
  );
}
