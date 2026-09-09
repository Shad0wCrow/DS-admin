"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import {
  listarPagosDocentes,
  registrarPagoDocente
} from "@/features/pagos/services/pago-service";

export function usarPagos() {
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const consulta = useQuery({
    queryKey: ["pagos-docentes"],
    queryFn: () => listarPagosDocentes(supabase)
  });

  return {
    pagos: consulta.data?.datos ?? [],
    total: consulta.data?.total ?? 0,
    cargando: consulta.isLoading,
    refrescar: () => void consulta.refetch(),
    registrar: (valores: Record<string, unknown>) => registrarPagoDocente(supabase, valores),
    confirmar: (liquidacionId: string) =>
      registrarPagoDocente(supabase, { liquidacion_id: liquidacionId })
  };
}
