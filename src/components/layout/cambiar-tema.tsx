"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { usarTema } from "@/components/layout/proveedor-tema";

function suscribirseMontaje() {
  return () => undefined;
}

function obtenerSnapshotCliente() {
  return true;
}

function obtenerSnapshotServidor() {
  return false;
}

export function CambiarTema() {
  const montado = useSyncExternalStore(
    suscribirseMontaje,
    obtenerSnapshotCliente,
    obtenerSnapshotServidor
  );
  const { tema, cambiarTema } = usarTema();

  const esClaro = tema === "claro";
  const etiqueta = !montado
    ? "Cambiar tema"
    : esClaro
      ? "Activar modo oscuro"
      : "Activar modo claro";

  return (
    <button
      type="button"
      onClick={cambiarTema}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-borde)] bg-[var(--color-panel)] text-[var(--color-texto)] transition hover:bg-[var(--color-panel-suave)]"
      title={etiqueta}
      aria-label={etiqueta}
      disabled={!montado}
    >
      {montado ? (
        <>
          <Moon
            className="absolute h-4 w-4 transition-opacity duration-150"
            style={{ opacity: esClaro ? 1 : 0 }}
            aria-hidden={!esClaro}
          />
          <Sun
            className="absolute h-4 w-4 transition-opacity duration-150"
            style={{ opacity: esClaro ? 0 : 1 }}
            aria-hidden={esClaro}
          />
        </>
      ) : (
        <div className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
