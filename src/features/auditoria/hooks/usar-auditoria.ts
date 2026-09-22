"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import { listarAuditoria } from "@/features/auditoria/services/auditoria-service";
import type { OpcionesListado } from "@/lib/utilidades/crud-service";

export function usarAuditoria(opciones: OpcionesListado = {}) {
  const supabase = useMemo(() => crearClienteNavegador(), []);

  const consulta = useQuery({
    queryKey: ["auditoria", opciones],
    queryFn: () => listarAuditoria(supabase, opciones)
  });

  return {
    registros: consulta.data?.datos ?? [],
    total: consulta.data?.total ?? 0,
    cargando: consulta.isLoading,
    refrescar: () => void consulta.refetch()
  };
}