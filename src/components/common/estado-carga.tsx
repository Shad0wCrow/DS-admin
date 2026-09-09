import { Loader2 } from "lucide-react";

export function EstadoCarga({ texto = "Cargando datos" }: { texto?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-2 rounded-lg border border-[var(--color-borde)] bg-[var(--color-panel)] text-sm text-[var(--color-texto-secundario)]">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{texto}</span>
    </div>
  );
}
