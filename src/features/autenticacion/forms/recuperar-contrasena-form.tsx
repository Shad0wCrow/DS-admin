"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Boton } from "@/components/ui/boton";
import { Campo } from "@/components/ui/campo";
import {
  recuperarContrasenaSchema,
  type RecuperarContrasenaValores
} from "@/features/autenticacion/schemas/autenticacion-schema";
import { recuperarContrasena } from "@/features/autenticacion/services/autenticacion-service";

export function RecuperarContrasenaForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<RecuperarContrasenaValores>({
    resolver: zodResolver(recuperarContrasenaSchema),
    defaultValues: {
      correo: ""
    }
  });

  async function manejarEnvio(valores: RecuperarContrasenaValores) {
    const resultado = await recuperarContrasena(valores);
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }

    toast.success("Correo de recuperación enviado.");
    reset();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(manejarEnvio)}>
      <Campo
        etiqueta="Correo"
        type="email"
        autoComplete="email"
        placeholder="correo@digitalservices.bo"
        error={errors.correo?.message}
        {...register("correo")}
      />
      <Boton type="submit" cargando={isSubmitting} className="w-full">
        <Mail className="h-4 w-4" />
        Enviar recuperación
      </Boton>
    </form>
  );
}
