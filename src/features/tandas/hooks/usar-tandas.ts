"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import {
  actualizarTanda,
  cancelarTanda,
  crearTanda,
  listarTandas
} from "@/features/tandas/services/tanda-service";

export function usarTandas() {
  const supabase = useMemo(() => crearClienteNavegador(), []);

  const consulta = useQuery({
    queryKey: ["tandas"],
    queryFn: () => listarTandas(supabase)
  });

  return {
    tandas: consulta.data?.datos ?? [],
    total: consulta.data?.total ?? 0,
    cargando: consulta.isLoading,
    refrescar: () => void consulta.refetch(),
    crear: (valores: Record<string, unknown>) => crearTanda(supabase, valores),
    actualizar: (id: string, valores: Record<string, unknown>) =>
      actualizarTanda(supabase, id, valores),
    cancelar: (id: string) => cancelarTanda(supabase, id)
  };
}
