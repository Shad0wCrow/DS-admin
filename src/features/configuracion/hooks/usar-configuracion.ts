"use client";

import { useQuery } from "@tanstack/react-query";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import {
  guardarConfiguracion,
  obtenerConfiguracion
} from "@/features/configuracion/services/configuracion-service";

export function usarConfiguracion() {
  const supabase = crearClienteNavegador();

  const consulta = useQuery({
    queryKey: ["configuracion"],
    queryFn: () => obtenerConfiguracion(supabase),
    staleTime: 5 * 60 * 1000
  });

  return {
    configuracion: consulta.data ?? null,
    cargando: consulta.isLoading,
    refrescar: () => void consulta.refetch(),
    guardar: (valores: Record<string, unknown>, id?: string) =>
      guardarConfiguracion(supabase, valores, id)
  };
}