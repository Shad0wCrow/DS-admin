import type { HTMLAttributes } from "react";
import { unirClases } from "@/lib/utilidades/clases";

type TonoInsignia = "neutro" | "exito" | "peligro";

const estilos: Record<TonoInsignia, string> = {
  neutro: "border-[var(--color-borde)] text-[var(--color-texto-secundario)]",
  exito: "border-[var(--color-borde)] text-[var(--color-exito)]",
  peligro: "border-[var(--color-borde)] text-[var(--color-peligro)]"
};

export function Insignia({
  className,
  tono = "neutro",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tono?: TonoInsignia }) {
  return (
    <span
      className={unirClases(
        "inline-flex h-7 items-center rounded-md border bg-transparent px-2 text-xs font-medium",
        estilos[tono],
        className
      )}
      {...props}
    />
  );
}
