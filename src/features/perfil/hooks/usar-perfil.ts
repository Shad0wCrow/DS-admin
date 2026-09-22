"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import {
  actualizarDocentePerfil,
  actualizarMateriaTemario,
  actualizarPerfilActual,
  agregarMateriaTemario,
  eliminarMateriaTemario,
  listarGananciasDocente,
  listarTemarioDocente,
  obtenerDocenteActual,
  type FiltrosGananciasDocente
} from "@/features/perfil/services/perfil-service";

export function usarPerfilDocente() {
  const supabase = useMemo(() => crearClienteNavegador(), []);
  const docente = useQuery({
    queryKey: ["docente-actual"],
    queryFn: () => obtenerDocenteActual(supabase)
  });

  const temario = useQuery({
    queryKey: ["temario-docente", docente.data?.id],
    queryFn: () => listarTemarioDocente(supabase, docente.data?.id ?? ""),
    enabled: Boolean(docente.data?.id)
  });

  return {
    docente: docente.data ?? null,
    temario: temario.data ?? [],
    cargando: docente.isLoading || temario.isLoading,
    refrescar: () => {
      void docente.refetch();
      void temario.refetch();
    },
    actualizarPerfil: (valores: Record<string, unknown>) => actualizarPerfilActual(supabase, valores),
    actualizarDocente: (docenteId: string, valores: Record<string, unknown>) =>
      actualizarDocentePerfil(supabase, docenteId, valores),
    agregarMateria: (valores: Record<string, unknown>) => agregarMateriaTemario(supabase, valores),
    actualizarMateria: (id: string, valores: Record<string, unknown>) =>
      actualizarMateriaTemario(supabase, id, valores),
    eliminarMateria: (id: string) => eliminarMateriaTemario(supabase, id)
  };
}

export function usarGananciasDocente(
  docenteId: string | null | undefined,
  filtros: FiltrosGananciasDocente
) {
  const supabase = useMemo(() => crearClienteNavegador(), []);

  const consulta = useQuery({
    queryKey: ["ganancias-docente", docenteId, filtros],
    queryFn: () => listarGananciasDocente(supabase, docenteId ?? "", filtros),
    enabled: Boolean(docenteId)
  });

  return {
    ganancias: consulta.data ?? [],
    cargando: consulta.isLoading,
    refrescar: () => void consulta.refetch()
  };
}
