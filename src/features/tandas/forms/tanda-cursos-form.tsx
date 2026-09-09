"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Boton } from "@/components/ui/boton";
import { Selector } from "@/components/ui/campo";
import { TablaDatos } from "@/components/ui/tabla-datos";
import { usarCursos } from "@/features/cursos/hooks/usar-cursos";
import { usarDocentes } from "@/features/docentes/hooks/usar-docentes";
import { usarTandaCursos } from "@/features/tandas/hooks/usar-tanda-cursos";
import { usarTandas } from "@/features/tandas/hooks/usar-tandas";
import {
  tandaCursoSchema,
  type TandaCursoValores
} from "@/features/tandas/schemas/tanda-curso-schema";
import type { TandaCurso } from "@/lib/supabase/tipos-base-datos";

function obtenerNombreDocente(docente: any) {
  if (docente?.usuarios) {
    return `${docente.usuarios.nombres ?? ""} ${docente.usuarios.apellidos ?? ""}`.trim();
  }
  return docente?.nombre_completo || docente?.id;
}

export function TandaCursosForm() {
  const tandasHook = usarTandas();
  const cursosHook = usarCursos();
  const docentesHook = usarDocentes();
  const relacionesHook = usarTandaCursos();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TandaCursoValores>({
    resolver: zodResolver(tandaCursoSchema),
    defaultValues: {
      tanda_id: "",
      curso_id: "",
      docente_id: ""
    }
  });

  const listaTandas = tandasHook.tandas;
  const listaCursos = cursosHook.cursos;
  const listaDocentes = docentesHook.docentes;
  const listaRelaciones = relacionesHook.registros;

  const mapaTandas = new Map(listaTandas.map((tanda) => [tanda.id, tanda.nombre]));
  const mapaCursos = new Map(listaCursos.map((curso) => [curso.id, curso.nombre]));
  const mapaDocentes = new Map(
    listaDocentes.map((docente: any) => [docente.id, obtenerNombreDocente(docente)])
  );

  const opcionesTandas = [
    { etiqueta: "Seleccionar tanda", valor: "" },
    ...listaTandas.map((tanda) => ({ etiqueta: tanda.nombre ?? "Tanda", valor: tanda.id }))
  ];

  const opcionesCursos = [
    { etiqueta: "Seleccionar curso", valor: "" },
    ...listaCursos.map((curso) => ({ etiqueta: curso.nombre ?? "Curso", valor: curso.id }))
  ];

  const opcionesDocentes = [
    { etiqueta: "Seleccionar docente", valor: "" },
    ...listaDocentes.map((docente: any) => ({
      etiqueta: obtenerNombreDocente(docente),
      valor: docente.id
    }))
  ];

  async function manejarEnvio(valores: TandaCursoValores) {
    const resultado = await relacionesHook.asignar(valores);
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }
    toast.success("Curso asignado a tanda.");
    reset();
    relacionesHook.refrescar();
  }

  async function manejarQuitar(id: string) {
    const resultado = await relacionesHook.quitar(id);
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }
    toast.success("Curso retirado de la tanda.");
    relacionesHook.refrescar();
  }

  return (
    <div className="grid gap-4">
      <form
        className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]"
        onSubmit={handleSubmit(manejarEnvio)}
      >
        <Selector
          etiqueta="Tanda"
          error={errors.tanda_id?.message}
          opciones={opcionesTandas}
          {...register("tanda_id")}
        />
        <Selector
          etiqueta="Curso"
          error={errors.curso_id?.message}
          opciones={opcionesCursos}
          {...register("curso_id")}
        />
        <Selector
          etiqueta="Docente"
          error={errors.docente_id?.message}
          opciones={opcionesDocentes}
          {...register("docente_id")}
        />
        <Boton type="submit" cargando={isSubmitting} className="md:mt-7">
          <Link2 className="h-4 w-4" />
          Asignar
        </Boton>
      </form>
      <TablaDatos
        columnas={[
          {
            clave: "tanda",
            titulo: "Tanda",
            renderizar: (fila: TandaCurso) => mapaTandas.get(fila.tanda_id) ?? fila.tanda_id
          },
          {
            clave: "curso",
            titulo: "Curso",
            renderizar: (fila: TandaCurso) => mapaCursos.get(fila.curso_id) ?? fila.curso_id
          },
          {
            clave: "docente",
            titulo: "Docente",
            renderizar: (fila: any) =>
              fila.docente_id ? (mapaDocentes.get(fila.docente_id) ?? fila.docente_id) : "Sin docente"
          },
          {
            clave: "acciones",
            titulo: "Acciones",
            renderizar: (fila: TandaCurso) => (
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-borde)] text-[var(--color-peligro)] hover:bg-[var(--color-panel-suave)]"
                title="Quitar"
                aria-label="Quitar"
                onClick={() => manejarQuitar(fila.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )
          }
        ]}
        datos={listaRelaciones}
        obtenerClave={(fila: TandaCurso) => fila.id}
        vacio="Sin cursos asignados a tandas"
      />
    </div>
  );
}