"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Boton } from "@/components/ui/boton";
import { Campo } from "@/components/ui/campo";
import { loginSchema, type LoginValores } from "@/features/autenticacion/schemas/autenticacion-schema";
import { iniciarSesion } from "@/features/autenticacion/services/autenticacion-service";

function obtenerDestinoSeguro(destino: string | null) {
  if (!destino || !destino.startsWith("/") || destino.startsWith("//")) {
    return "/dashboard";
  }

  if (destino.startsWith("/login") || destino.startsWith("/recuperar-contrasena")) {
    return "/dashboard";
  }

  return destino;
}

export function LoginForm() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValores>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      correo: "",
      contrasena: ""
    }
  });

  async function manejarEnvio(valores: LoginValores) {
    const resultado = await iniciarSesion(valores);
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }

    toast.success("Sesión iniciada correctamente.");
    router.replace(obtenerDestinoSeguro(parametros.get("redirigir")) as Route);
    router.refresh();
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
      <div className="grid gap-2">
        <Campo
          etiqueta="Contraseña"
          type={mostrarContrasena ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Ingresa tu contraseña"
          error={errors.contrasena?.message}
          {...register("contrasena")}
        />
        <button
          type="button"
          onClick={() => setMostrarContrasena((valor) => !valor)}
          className="inline-flex w-max items-center gap-2 text-xs font-medium text-[var(--color-texto-secundario)] hover:text-[var(--color-texto)]"
        >
          {mostrarContrasena ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
        </button>
      </div>
      <Boton type="submit" cargando={isSubmitting} className="w-full">
        <LogIn className="h-4 w-4" />
        Iniciar sesión
      </Boton>
    </form>
  );
}
