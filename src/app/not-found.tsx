import Link from "next/link";
import React from "react";

const PaginaNoEncontrada: React.FC = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-fondo)] px-6">
      <section className="max-w-md text-center">
        <p className="text-sm font-medium text-[var(--color-texto-secundario)]">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--color-texto)]">
          Página no encontrada
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-texto-secundario)]">
          La sección solicitada no existe o no está disponible para tu sesión.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-accion)] px-4 text-sm font-medium text-[var(--color-accion-texto)]"
        >
          Volver al panel
        </Link>
      </section>
    </main>
  );
};

export default PaginaNoEncontrada;