"use client";

import { useQuery } from "@tanstack/react-query";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import {
  activarDocente,
  actualizarDocente,
  crearDocente,
  desactivarDocente,
  listarDocentes
} from "@/features/docentes/services/docente-service";

export function usarDocentes() {
  const supabase = crearClienteNavegador();

  const consulta = useQuery({
    queryKey: ["docentes"],
    queryFn: () => listarDocentes(supabase),
    retry: 1
  });

  return {
    docentes: consulta.data?.datos ?? [],
    total: consulta.data?.total ?? 0,
    cargando: consulta.isLoading,
    refrescar: () => void consulta.refetch(),
    crear: (valores: Record<string, unknown>) => crearDocente(supabase, valores),
    actualizar: (id: string, valores: Record<string, unknown>) =>
      actualizarDocente(supabase, id, valores),
    desactivar: (id: string) => desactivarDocente(supabase, id),
    activar: (id: string) => activarDocente(supabase, id)
  };
}
