import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { unirClases } from "@/lib/utilidades/clases";

const estiloControl =
  "w-full rounded-md border border-[var(--color-borde)] bg-[var(--color-panel)] px-3 text-sm text-[var(--color-texto)] outline-none transition placeholder:text-[var(--color-texto-secundario)] focus:border-[var(--color-borde-fuerte)]";

type CampoProps = InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string;
  error?: string;
};

export function Campo({ etiqueta, error, className, ...props }: CampoProps) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-[var(--color-texto)]">{etiqueta}</span>
      <input className={unirClases(estiloControl, "h-10", className)} {...props} />
      {error ? <span className="text-xs text-[var(--color-peligro)]">{error}</span> : null}
    </label>
  );
}

type AreaTextoProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  etiqueta: string;
  error?: string;
};

export function AreaTexto({ etiqueta, error, className, ...props }: AreaTextoProps) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-[var(--color-texto)]">{etiqueta}</span>
      <textarea
        className={unirClases(estiloControl, "min-h-28 py-3", className)}
        {...props}
      />
      {error ? <span className="text-xs text-[var(--color-peligro)]">{error}</span> : null}
    </label>
  );
}

type SelectorProps = SelectHTMLAttributes<HTMLSelectElement> & {
  etiqueta: string;
  error?: string;
  opciones: Array<{ etiqueta: string; valor: string }>;
};

export function Selector({ etiqueta, error, opciones, className, ...props }: SelectorProps) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-[var(--color-texto)]">{etiqueta}</span>
      <select className={unirClases(estiloControl, "h-10", className)} {...props}>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-[var(--color-peligro)]">{error}</span> : null}
    </label>
  );
}
