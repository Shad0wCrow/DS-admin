import type { LucideIcon } from "lucide-react";
import { Tarjeta } from "@/components/ui/tarjeta";

type TarjetaMetricaProps = {
  titulo: string;
  valor: string;
  detalle?: string;
  icono: LucideIcon;
};

export function TarjetaMetrica({ titulo, valor, detalle, icono: Icono }: TarjetaMetricaProps) {
  return (
    <Tarjeta className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--color-texto-secundario)]">{titulo}</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-texto)]">{valor}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-borde)] bg-[var(--color-panel-suave)]">
          <Icono className="h-5 w-5 text-[var(--color-texto)]" />
        </div>
      </div>
      {detalle ? <p className="mt-4 text-xs text-[var(--color-texto-secundario)]">{detalle}</p> : null}
    </Tarjeta>
  );
}
