  import type { Metadata } from "next";
  import { Toaster } from "sonner";
  import { ProveedorConsultas } from "@/components/layout/proveedor-consultas";
  import { ProveedorTema } from "@/components/layout/proveedor-tema";
  import "./globals.css";

  export const metadata: Metadata = {
    title: "DigitalServices Admin",
    description: "Sistema administrativo para DigitalServices"
  };

  export default function RootLayout({
    children
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="es" suppressHydrationWarning>
        <body>
          <ProveedorTema>
            <ProveedorConsultas>{children}</ProveedorConsultas>
            <Toaster richColors position="top-right" />
          </ProveedorTema>
        </body>
      </html>
    );
  }
