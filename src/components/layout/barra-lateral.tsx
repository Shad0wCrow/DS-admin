"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { LogoDigitalServices } from "@/components/common/logo";
import { navegacionPrincipal } from "@/config/navegacion/navegacion";
import type { RolUsuario } from "@/lib/autenticacion/roles";
import { unirClases } from "@/lib/utilidades/clases";

type BarraLateralProps = {
  rol: RolUsuario;
  abierta: boolean;
  cerrar: () => void;
};

export function BarraLateral({ rol, abierta, cerrar }: BarraLateralProps) {
  const pathname = usePathname();
  const elementos = navegacionPrincipal.filter((elemento) => elemento.roles.includes(rol));

  return (
    <>
      <div
        className={unirClases(
          "fixed inset-0 z-30 bg-black/30 transition md:hidden",
          abierta ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={cerrar}
      />
      <aside
        className={unirClases(
          "fixed inset-y-0 left-0 z-40 flex w-72 h-screen flex-col border-r border-[var(--color-borde)] bg-[var(--color-panel)] transition-transform md:sticky md:top-0 md:translate-x-0",
          abierta ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative flex h-20 items-center justify-center border-b border-[var(--color-borde)] px-4">
          <Link
            href="/dashboard"
            className="flex h-full w-full items-center justify-center p-1 outline-none border-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <LogoDigitalServices compacto className="w-full justify-center" />
          </Link>
          <button
            type="button"
            onClick={cerrar}
            className="absolute right-3 inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-[var(--color-panel-suave)] focus:outline-none focus-visible:ring-0 md:hidden"
            aria-label="Cerrar navegación"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {elementos.map((elemento) => {
            const activo = pathname === elemento.href || pathname.startsWith(`${elemento.href}/`);
            const Icono = elemento.icono;

            return (
              <Link
                key={elemento.href}
                href={elemento.href}
                onClick={cerrar}
                className={unirClases(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                  activo
                    ? "bg-[var(--color-accion)] text-[var(--color-accion-texto)]"
                    : "text-[var(--color-texto-secundario)] hover:bg-[var(--color-panel-suave)] hover:text-[var(--color-texto)]"
                )}
              >
                <Icono className="h-4 w-4 shrink-0" />
                <span>{elemento.titulo}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}