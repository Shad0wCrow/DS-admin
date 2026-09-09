import Link from "next/link";
import { RecuperarContrasenaForm } from "@/features/autenticacion/forms/recuperar-contrasena-form";

export default function RecuperarContrasenaPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-medium text-[var(--color-texto-secundario)]">DigitalServices</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-texto)]">
          Recuperar contraseña
        </h1>
      </div>
      <RecuperarContrasenaForm />
      <Link
        href="/login"
        className="mt-5 inline-flex text-sm font-medium text-[var(--color-texto-secundario)] hover:text-[var(--color-texto)]"
      >
        Volver al inicio de sesión
      </Link>
    </div>
  );
}
