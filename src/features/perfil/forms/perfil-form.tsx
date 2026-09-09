"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Boton } from "@/components/ui/boton";
import { Campo } from "@/components/ui/campo";
import { usarPerfilActual } from "@/features/autenticacion/hooks/usar-perfil-actual";
import { usarPerfilDocente } from "@/features/perfil/hooks/usar-perfil";
import { perfilSchema, type PerfilValores } from "@/features/perfil/schemas/perfil-schema";

export function PerfilForm() {
  const perfilActual = usarPerfilActual();
  const perfilDocente = usarPerfilDocente();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PerfilValores>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombres: "",
      apellidos: "",
      telefono: ""
    }
  });

  useEffect(() => {
    if (perfilActual.data) {
      reset({
        nombres: perfilActual.data.nombres,
        apellidos: perfilActual.data.apellidos,
        telefono: perfilActual.data.telefono ?? ""
      });
    }
  }, [perfilActual.data, reset]);

  async function manejarEnvio(valores: PerfilValores) {
    const resultado = await perfilDocente.actualizarPerfil(valores);
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }
    toast.success("Perfil actualizado.");
    await perfilActual.refetch();
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(manejarEnvio)}>
      <Campo etiqueta="Nombres" error={errors.nombres?.message} {...register("nombres")} />
      <Campo etiqueta="Apellidos" error={errors.apellidos?.message} {...register("apellidos")} />
      <Campo etiqueta="Teléfono" error={errors.telefono?.message} {...register("telefono")} />
      <div className="md:col-span-2">
        <Boton type="submit" cargando={isSubmitting}>
          <Save className="h-4 w-4" />
          Guardar perfil
        </Boton>
      </div>
    </form>
  );
}
