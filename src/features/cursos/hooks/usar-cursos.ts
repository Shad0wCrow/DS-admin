"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import {
  activarCurso,
  actualizarCurso,
  crearCurso,
  desactivarCurso,
  listarCursos
} from "@/features/cursos/services/curso-service";

export function usarCursos() {
  const supabase = useMemo(() => crearClienteNavegador(), []);

  const consulta = useQuery({
    queryKey: ["cursos"],
    queryFn: () => listarCursos(supabase)
  });

  return {
    cursos: consulta.data?.datos ?? [],
    total: consulta.data?.total ?? 0,
    cargando: consulta.isLoading,
    refrescar: () => void consulta.refetch(),
    crear: (valores: Record<string, unknown>) => crearCurso(supabase, valores),
    actualizar: (id: string, valores: Record<string, unknown>) =>
      actualizarCurso(supabase, id, valores),
    desactivar: (id: string) => desactivarCurso(supabase, id),
    activar: (id: string) => activarCurso(supabase, id)
  };
}
