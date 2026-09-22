import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

interface DatosUsuarioCookie {
  userId: string | null;
  rol: string | null;
}

function obtenerDatosUsuarioDesdeCookie(request: NextRequest): DatosUsuarioCookie {
  try {
    const cookies = request.cookies.getAll();
    const cookieAuth = cookies.find((c) => c.name.endsWith("-auth-token"));
    if (!cookieAuth) return { userId: null, rol: null };

    let token = cookieAuth.value;
    if (token.startsWith("[")) {
      const parsed = JSON.parse(token);
      token = Array.isArray(parsed) ? parsed[0] : parsed;
    }

    if (!token || typeof token !== "string") return { userId: null, rol: null };
    const partes = token.split(".");
    if (partes.length < 2) return { userId: null, rol: null };

    const payload = JSON.parse(Buffer.from(partes[1], "base64").toString("utf-8"));

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { userId: null, rol: null };
    }

    const rol = (
      payload.user_metadata?.rol ??
      payload.app_metadata?.rol ??
      payload.rol ??
      ""
    ).toLowerCase();

    return {
      userId: payload.sub ?? null,
      rol: rol || null
    };
  } catch {
    return { userId: null, rol: null };
  }
}

const RUTAS_PERMITIDAS_DOCENTE = ["/estudiantes", "/inscripciones"];
const RUTAS_PERMITIDAS_ADMIN = [
  "/dashboard",
  "/estudiantes",
  "/cursos",
  "/tandas",
  "/inscripciones",
  "/liquidaciones",
  "/pagos",
  "/reportes",
];

function esRutaPermitida(pathname: string, rol: string): boolean {
  if (rol === "superadmin") return true;

  const verificarAcceso = (rutasPermitidas: string[]) =>
    rutasPermitidas.some(
      (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
    );

  if (rol === "admin") return verificarAcceso(RUTAS_PERMITIDAS_ADMIN);
  if (rol === "docente") return verificarAcceso(RUTAS_PERMITIDAS_DOCENTE);

  return false;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const cabecerasSolicitud = new Headers(request.headers);

  let respuesta = NextResponse.next({
    request: {
      headers: cabecerasSolicitud
    }
  });

  let { userId, rol } = obtenerDatosUsuarioDesdeCookie(request);

  if (!userId || !rol) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            respuesta = NextResponse.next({
              request: {
                headers: cabecerasSolicitud
              }
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              respuesta.cookies.set(name, value, options)
            );
          }
        }
      }
    );

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      rol = (
        (user.user_metadata?.rol as string) ??
        (user.app_metadata?.rol as string) ??
        ""
      ).toLowerCase();
    }
  }

  if (userId) {
    cabecerasSolicitud.set("x-user-id", userId);
    if (rol) cabecerasSolicitud.set("x-user-role", rol);

    const esRutaPublica = pathname === "/login" || pathname.startsWith("/api");
    if (!esRutaPublica && rol && !esRutaPermitida(pathname, rol)) {
      const rutaRedireccion = rol === "docente" ? "/estudiantes" : "/dashboard";
      return NextResponse.redirect(new URL(rutaRedireccion, request.url));
    }

    respuesta = NextResponse.next({
      request: {
        headers: cabecerasSolicitud
      }
    });
  }

  return respuesta;
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
  ]
};