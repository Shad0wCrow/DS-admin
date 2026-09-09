"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import {
  actualizarEstudiante,
  buscarEstudiantesOpciones,
  crearEstudiante,
  listarEstudiantes
} from "@/features/estudiantes/services/estudiante-service";

export function usarEstudiantes() {
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const consulta = useQuery({
    queryKey: ["estudiantes"],
    queryFn: () => listarEstudiantes(supabase)
  });

  return {
    estudiantes: consulta.data?.datos ?? [],
    total: consulta.data?.total ?? 0,
    cargando: consulta.isLoading,
    refrescar: () => void consulta.refetch(),
    crear: (valores: Record<string, unknown>) => crearEstudiante(supabase, valores),
    actualizar: (id: string, valores: Record<string, unknown>) =>
      actualizarEstudiante(supabase, id, valores)
  };
}

export function usarBuscarEstudiantes(busqueda: string) {
  const supabase = useMemo(() => crearClienteNavegador(), []);

  const consulta = useQuery({
    queryKey: ["estudiantes-busqueda", busqueda],
    queryFn: () => buscarEstudiantesOpciones(supabase, busqueda),
    enabled: busqueda.trim().length >= 3,
    staleTime: 1000 * 60 * 5
  });

  return {
    opciones: consulta.data ?? [],
    cargando: consulta.isLoading
  };
}
