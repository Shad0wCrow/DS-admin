"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import {
  obtenerMetricasAdministrativas,
  type FiltrosMetricasAdministrativas
} from "@/features/reportes/services/reporte-service";

export function usarMetricasAdministrativas(filtros: FiltrosMetricasAdministrativas = {}) {
  const supabase = useMemo(() => crearClienteNavegador(), []);

  return useQuery({
    queryKey: ["metricas-administrativas", filtros],
    queryFn: () => obtenerMetricasAdministrativas(supabase, filtros),
    retry: false,
    staleTime: 2 * 60_000,
    placeholderData: (datosPrevios) => datosPrevios
  });
}
