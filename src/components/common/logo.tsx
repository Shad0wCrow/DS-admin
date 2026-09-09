"use client";

import { useState } from "react";
import { marcaDigitalServices } from "@/config/marca/marca";
import { unirClases } from "@/lib/utilidades/clases";

type LogoDigitalServicesProps = {
  className?: string;
  mostrarNombre?: boolean;
  compacto?: boolean;
};

export function LogoDigitalServices({
  className,
  mostrarNombre = true,
  compacto = false
}: LogoDigitalServicesProps) {
  const logoBlanco = marcaDigitalServices.logoClaro || marcaDigitalServices.logoOscuro;
  const logoNegro = marcaDigitalServices.logoOscuro || marcaDigitalServices.logoClaro;

  const [blancoFallo, setBlancoFallo] = useState(false);
  const [negroFallo, setNegroFallo] = useState(false);

  const blancoDisponible = Boolean(logoBlanco) && !blancoFallo;
  const negroDisponible = Boolean(logoNegro) && !negroFallo;

  const mostrarRespaldo = !blancoDisponible && !negroDisponible;

  if (mostrarRespaldo) {
    return (
      <div className={unirClases("flex w-full min-w-0 items-center justify-center gap-3", className)}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--color-borde)] bg-[var(--color-panel-suave)] text-sm font-semibold text-[var(--color-texto)]">
          DS
        </span>
        {mostrarNombre ? (
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-5 text-[var(--color-texto)]">
              {marcaDigitalServices.nombre}
            </span>
            {!compacto ? (
              <span className="block truncate text-xs text-[var(--color-texto-secundario)]">
                Admin
              </span>
            ) : null}
          </span>
        ) : null}
      </div>
    );
  }

  const alturaLogo = compacto ? "h-16 max-h-16 scale-200" : "h-20 max-h-20 scale-125";

  return (
    <div className={unirClases("flex w-full min-w-0 items-center justify-center overflow-visible", className)}>
      {/* Se muestra en tema claro (fondo claro -> logo oscuro/negro) */}
      {negroDisponible ? (
        <img
          src={logoNegro}
          alt={marcaDigitalServices.nombre}
          onError={() => setNegroFallo(true)}
          className={unirClases("logo-tema-claro w-auto max-w-full object-contain transition-transform", alturaLogo)}
          loading="eager"
        />
      ) : null}
      {blancoDisponible ? (
        <img
          src={logoBlanco}
          alt={marcaDigitalServices.nombre}
          onError={() => setBlancoFallo(true)}
          className={unirClases("logo-tema-oscuro w-auto max-w-full object-contain transition-transform", alturaLogo)}
          loading="eager"
        />
      ) : null}
    </div>
  );
}