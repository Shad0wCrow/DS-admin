import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { unirClases } from "@/lib/utilidades/clases";

type VarianteBoton = "principal" | "secundario" | "fantasma" | "peligro";

type BotonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBoton;
  cargando?: boolean;
};

const estilos: Record<VarianteBoton, string> = {
  principal: "bg-[var(--color-accion)] text-[var(--color-accion-texto)] hover:opacity-90",
  secundario:
    "border border-[var(--color-borde)] bg-[var(--color-panel)] text-[var(--color-texto)] hover:bg-[var(--color-panel-suave)]",
  fantasma: "text-[var(--color-texto)] hover:bg-[var(--color-panel-suave)]",
  peligro:
    "border border-[var(--color-borde)] bg-[var(--color-panel)] text-[var(--color-peligro)] hover:bg-[var(--color-panel-suave)]"
};

export function Boton({
  variante = "principal",
  cargando = false,
  className,
  children,
  disabled,
  ...props
}: BotonProps) {
  return (
    <button
      className={unirClases(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--color-borde-fuerte)] disabled:opacity-60",
        estilos[variante],
        className
      )}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
