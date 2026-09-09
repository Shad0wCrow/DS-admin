"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Tema = "claro" | "oscuro";

type ContextoTema = {
  tema: Tema;
  cambiarTema: () => void;
  definirTema: (tema: Tema) => void;
};

const TemaContexto = createContext<ContextoTema | null>(null);

function obtenerTemaInicial(): Tema {
  if (typeof window === "undefined") return "claro";
  const temaGuardado = window.localStorage.getItem("digitalservices-tema");
  if (temaGuardado === "claro" || temaGuardado === "oscuro") return temaGuardado;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro";
}

export function ProveedorTema({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => obtenerTemaInicial());

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    window.localStorage.setItem("digitalservices-tema", tema);
  }, [tema]);

  const valor = useMemo<ContextoTema>(
    () => ({
      tema,
      cambiarTema: () => setTema((temaActual) => (temaActual === "claro" ? "oscuro" : "claro")),
      definirTema: setTema
    }),
    [tema]
  );

  return <TemaContexto.Provider value={valor}>{children}</TemaContexto.Provider>;
}

export function usarTema() {
  const contexto = useContext(TemaContexto);
  if (!contexto) {
    throw new Error("usarTema debe utilizarse dentro de ProveedorTema.");
  }
  return contexto;
}
