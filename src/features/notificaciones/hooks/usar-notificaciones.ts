"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import {
  listarNotificaciones,
  marcarNotificacionLeida
} from "@/features/notificaciones/services/notificacion-service";

export function usarNotificaciones() {
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const consulta = useQuery({
    queryKey: ["notificaciones"],
    queryFn: () => listarNotificaciones(supabase)
  });

  return {
    notificaciones: consulta.data?.datos ?? [],
    total: consulta.data?.total ?? 0,
    cargando: consulta.isLoading,
    refrescar: () => void consulta.refetch(),
    marcarLeida: (id: string) => marcarNotificacionLeida(supabase, id)
  };
}
