"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import {
  activarUsuario,
  actualizarUsuario,
  crearUsuario,
  desactivarUsuario,
  listarUsuarios,
  type ParametrosListarUsuarios
} from "@/features/usuarios/services/usuario-service";

export function usarUsuarios(parametros: ParametrosListarUsuarios = {}) {
  const supabase = useMemo(() => crearClienteNavegador(), []);

  const consulta = useQuery({
    queryKey: ["usuarios", parametros],
    queryFn: () => listarUsuarios(supabase, parametros)
  });


  return {
    usuarios: consulta.data?.datos ?? [],
    total: consulta.data?.total ?? 0,
    cargando: consulta.isLoading,
    refrescar: () => void consulta.refetch(),
    crear: (valores: Record<string, unknown>) => crearUsuario(supabase, valores),
    actualizar: (id: string, valores: Record<string, unknown>) =>
      actualizarUsuario(supabase, id, valores),
    desactivar: (id: string) => desactivarUsuario(supabase, id),
    activar: (id: string) => activarUsuario(supabase, id)
  };
}