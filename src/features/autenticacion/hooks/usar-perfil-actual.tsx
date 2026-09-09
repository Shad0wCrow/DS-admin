"use client";

import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { obtenerPerfilActual } from "@/features/autenticacion/services/autenticacion-service";
import type { PerfilActual } from "@/features/autenticacion/types/autenticacion-types";

const PerfilActualContexto = createContext<PerfilActual | null>(null);

export function ProveedorPerfilActual({
  children,
  perfilInicial
}: {
  children: React.ReactNode;
  perfilInicial: PerfilActual;
}) {
  return (
    <PerfilActualContexto.Provider value={perfilInicial}>
      {children}
    </PerfilActualContexto.Provider>
  );
}

export function usarPerfilActual() {
  const perfilInicial = useContext(PerfilActualContexto);

  return useQuery({
    queryKey: ["perfil-actual"],
    queryFn: obtenerPerfilActual,
    initialData: perfilInicial ?? undefined,
    staleTime: 5 * 60_000
  });
}
