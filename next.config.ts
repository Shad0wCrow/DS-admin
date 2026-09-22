import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raizProyecto = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // La convencion local usa hooks `usar*`; el modo infer de React Compiler solo
  // reconoce hooks `use*` y puede cachear llamadas a esos hooks como funciones puras.
  reactCompiler: {
    compilationMode: "annotation"
  },
  typedRoutes: true,
  turbopack: {
    root: raizProyecto
  }
};

export default nextConfig;
