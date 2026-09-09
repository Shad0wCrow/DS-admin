import { NextResponse, type NextRequest } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const codigo = url.searchParams.get("code");
  const siguiente = url.searchParams.get("next") ?? "/dashboard";

  if (codigo) {
    const supabase = await crearClienteServidor();
    await supabase.auth.exchangeCodeForSession(codigo);
  }

  return NextResponse.redirect(new URL(siguiente, url.origin));
}
