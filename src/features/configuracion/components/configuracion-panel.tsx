import { EncabezadoPagina } from "@/components/common/encabezado-pagina";
import { Tarjeta } from "@/components/ui/tarjeta";
import { ConfiguracionForm } from "@/features/configuracion/forms/configuracion-form";

export function ConfiguracionPanel() {
  return (
    <div className="grid gap-6">
      <EncabezadoPagina
        titulo="Configuración"
        descripcion="Porcentajes de distribución financiera entre docentes y DigitalServices."
      />
      <Tarjeta className="p-5">
        <ConfiguracionForm />
      </Tarjeta>
    </div>
  );
}
