"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function ProveedorConsultas({ children }: { children: React.ReactNode }) {
  const [clienteConsulta] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1
          }
        }
      })
  );

  return <QueryClientProvider client={clienteConsulta}>{children}</QueryClientProvider>;
}
