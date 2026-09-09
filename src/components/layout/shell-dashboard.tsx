"use client";

import { useState } from "react";
import { BarraLateral } from "@/components/layout/barra-lateral";
import { EncabezadoDashboard } from "@/components/layout/encabezado-dashboard";
import { ProveedorPerfilActual } from "@/features/autenticacion/hooks/usar-perfil-actual";
import type { PerfilActual } from "@/features/autenticacion/types/autenticacion-types";

export function ShellDashboard({
  children,
  perfilInicial
}: {
  children: React.ReactNode;
  perfilInicial: PerfilActual;
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const rol = perfilInicial.rol;
  const nombre = `${perfilInicial.nombres} ${perfilInicial.apellidos}`;

  return (
    <ProveedorPerfilActual perfilInicial={perfilInicial}>
      <div className="flex min-h-screen bg-[var(--color-fondo)]">
        <BarraLateral rol={rol} abierta={menuAbierto} cerrar={() => setMenuAbierto(false)} />
        <div className="min-w-0 flex-1">
          <EncabezadoDashboard
            rol={rol}
            nombre={nombre}
            abrirMenu={() => setMenuAbierto(true)}
          />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </ProveedorPerfilActual>
  );
}
