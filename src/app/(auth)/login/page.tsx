import { Suspense } from "react";
import Link from "next/link";
import { EstadoCarga } from "@/components/common/estado-carga";
import { LogoDigitalServices } from "@/components/common/logo";
import { LoginForm } from "@/features/autenticacion/forms/login-form";

export default function LoginPage() {
  return (
    <div>
      <div className="mb-6">
        <LogoDigitalServices compacto />
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-texto)]">
          Acceso administrativo
        </h1>
      </div>
      <Suspense fallback={<EstadoCarga />}>
        <LoginForm />
      </Suspense>
      <Link
        href="/recuperar-contrasena"
        className="mt-5 inline-flex text-sm font-medium text-[var(--color-texto-secundario)] hover:text-[var(--color-texto)]"
      >
        Recuperar contraseña
      </Link>
    </div>
  );
}