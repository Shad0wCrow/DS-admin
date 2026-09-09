import type { HTMLAttributes } from "react";
import { unirClases } from "@/lib/utilidades/clases";

export function Tarjeta({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={unirClases(
        "rounded-lg border border-[var(--color-borde)] bg-[var(--color-panel)] shadow-[var(--sombra-panel)]",
        className
      )}
      {...props}
    />
  );
}
