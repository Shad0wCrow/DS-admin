import { CambiarTema } from "@/components/layout/cambiar-tema";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-[var(--color-fondo)] px-4 py-6">
      <div className="mx-auto flex w-full max-w-6xl justify-end">
        <CambiarTema />
      </div>
      <section className="mx-auto grid w-full max-w-md place-items-center">
        <div className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-panel)] p-6 shadow-[var(--sombra-panel)]">
          {children}
        </div>
      </section>
    </main>
  );
}
