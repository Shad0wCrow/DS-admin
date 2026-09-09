"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import { listarTandaCursos } from "@/features/tandas/services/tanda-service";
import { crearRegistro, eliminarRegistro } from "@/lib/utilidades/crud-service";
import type { TandaCurso } from "@/lib/supabase/tipos-base-datos";

export function usarTandaCursos() {
  const supabase = useMemo(() => crearClienteNavegador(), []);

  const consulta = useQuery({
    queryKey: ["tanda-cursos"],
    queryFn: () => listarTandaCursos(supabase, { ordenarPor: "id", ascendente: true })
  });

  async function asignar(valores: Record<string, unknown>) {
    return crearRegistro<TandaCurso>(supabase, "tanda_cursos", valores);
  }

  async function quitar(id: string) {
    return eliminarRegistro(supabase, "tanda_cursos", id);
  }

  return {
    registros: consulta.data?.datos ?? [],
    datos: consulta.data?.datos ?? [],
    cargando: consulta.isLoading,
    asignar,
    quitar,
    refrescar: () => void consulta.refetch()
  };
}
