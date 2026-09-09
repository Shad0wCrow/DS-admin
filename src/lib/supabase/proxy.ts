import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { coincideRuta, rutasProtegidas } from "@/config/permisos/permisos";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/configuracion";
import type { BaseDatos } from "@/lib/supabase/tipos-base-datos";

const rutasAutenticacion = ["/login", "/recuperar-contrasena"];
const dashboard = "/dashboard";

function esRutaProtegida(ruta: string) {
  return rutasProtegidas.some((rutaProtegida) => coincideRuta(ruta, rutaProtegida));
}

export async function actualizarSesion(request: NextRequest) {
  let respuesta = NextResponse.next({
    request
  });

  const supabase = createServerClient<BaseDatos>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesParaGuardar) {
        cookiesParaGuardar.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = NextResponse.next({ request });
        cookiesParaGuardar.forEach(({ name, value, options }) => {
          respuesta.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const ruta = request.nextUrl.pathname;
  const estaEnAuth = rutasAutenticacion.some((rutaAuth) => ruta.startsWith(rutaAuth));

  if (!user && esRutaProtegida(ruta)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirigir", ruta);
    return NextResponse.redirect(url);
  }

  if (user && estaEnAuth) {
    const url = request.nextUrl.clone();
    url.pathname = dashboard;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return respuesta;
}