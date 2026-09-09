import { EncabezadoPagina } from "@/components/common/encabezado-pagina";
import { Tarjeta } from "@/components/ui/tarjeta";
import { GananciasDocentePanel } from "@/features/perfil/components/ganancias-docente-panel";
import { ArchivosDocenteForm } from "@/features/perfil/forms/archivos-docente-form";
import { PerfilForm } from "@/features/perfil/forms/perfil-form";
import { TemarioForm } from "@/features/perfil/forms/temario-form";

export function PerfilPanel() {
  return (
    <div className="grid gap-6">
      <EncabezadoPagina
        titulo="Perfil"
        descripcion="Datos personales, medios de pago y temario docente."
      />
      <Tarjeta className="p-5">
        <h2 className="mb-4 text-base font-semibold text-[var(--color-texto)]">Datos personales</h2>
        <PerfilForm />
      </Tarjeta>
      <Tarjeta className="p-5">
        <h2 className="mb-4 text-base font-semibold text-[var(--color-texto)]">Archivos docentes</h2>
        <ArchivosDocenteForm />
      </Tarjeta>
      <Tarjeta className="p-5">
        <h2 className="mb-4 text-base font-semibold text-[var(--color-texto)]">Temario</h2>
        <TemarioForm />
      </Tarjeta>
      <GananciasDocentePanel />
    </div>
  );
}
