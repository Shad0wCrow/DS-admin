"use client";

import { LogOut, Menu, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { LogoDigitalServices } from "@/components/common/logo";
import { CambiarTema } from "@/components/layout/cambiar-tema";
import { Boton } from "@/components/ui/boton";
import { cerrarSesion } from "@/features/autenticacion/services/autenticacion-service";
import type { RolUsuario } from "@/lib/autenticacion/roles";
import { etiquetasRol } from "@/lib/autenticacion/roles";

type EncabezadoDashboardProps = {
  abrirMenu: () => void;
  rol: RolUsuario;
  nombre: string;
};

export function EncabezadoDashboard({ abrirMenu, rol, nombre }: EncabezadoDashboardProps) {
  async function manejarCerrarSesion() {
    const resultado = await cerrarSesion();
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }
    window.location.replace("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--color-borde)] bg-[var(--color-fondo)] px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={abrirMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-borde)] bg-[var(--color-panel)] md:hidden"
          aria-label="Abrir navegación"
        >
          <Menu className="h-4 w-4" />
        </button>
        <LogoDigitalServices className="hidden sm:flex md:hidden" compacto />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--color-texto)]">{nombre}</p>
          <p className="text-xs text-[var(--color-texto-secundario)]">{etiquetasRol[rol]}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <CambiarTema />
        <Link
          href="/perfil"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-borde)] bg-[var(--color-panel)] text-[var(--color-texto)] transition hover:bg-[var(--color-panel-suave)]"
          aria-label="Abrir perfil"
          title="Perfil"
        >
          <User className="h-4 w-4" />
        </Link>
        <Boton variante="secundario" className="hidden px-3 md:inline-flex" onClick={manejarCerrarSesion}>
          <LogOut className="h-4 w-4" />
          Salir
        </Boton>
      </div>
    </header>
  );
}
