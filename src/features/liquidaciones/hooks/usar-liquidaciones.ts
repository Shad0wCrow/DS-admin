"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import {
  anularLiquidacion,
  listarLiquidaciones,
  obtenerDetalleLiquidacion,
  sincronizarLiquidacionesTanda
} from "@/features/liquidaciones/services/liquidacion-service";

export function usarLiquidaciones(tandaId?: string) {
  const supabase = useMemo(() => crearClienteNavegador(), []);

  const consulta = useQuery({
    queryKey: ["liquidaciones", tandaId ?? "todas"],
    queryFn: () => listarLiquidaciones(supabase, tandaId)
  });

  return {
    liquidaciones: consulta.data?.datos ?? [],
    total: consulta.data?.total ?? 0,
    cargando: consulta.isLoading,
    refrescar: () => void consulta.refetch(),
    sincronizar: (idTanda: string) => sincronizarLiquidacionesTanda(supabase, idTanda),
    obtenerDetalle: (id: string) => obtenerDetalleLiquidacion(supabase, id),
    anular: (id: string) => anularLiquidacion(supabase, id)
  };
}
