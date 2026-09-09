"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import {
  listarInscripciones,
  registrarInscripcion
} from "@/features/inscripciones/services/inscripcion-service";

export function usarInscripciones() {
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const consulta = useQuery({
    queryKey: ["inscripciones"],
    queryFn: () => listarInscripciones(supabase)
  });

  return {
    inscripciones: consulta.data?.datos ?? [],
    total: consulta.data?.total ?? 0,
    cargando: consulta.isLoading,
    refrescar: () => void consulta.refetch(),
    registrar: (valores: Record<string, unknown>) => registrarInscripcion(supabase, valores)
  };
}
