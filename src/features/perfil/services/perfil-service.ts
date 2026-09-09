import type { SupabaseClient } from "@supabase/supabase-js";
import {
  actualizarRegistro,
  crearRegistro,
  eliminarRegistro
} from "@/lib/utilidades/crud-service";
import type { BaseDatos, Docente, Liquidacion, Usuario } from "@/lib/supabase/tipos-base-datos";
import type { TemarioDocente } from "@/features/perfil/types/perfil-types";

export type FiltrosGananciasDocente = {
  tanda_id?: string;
  mes?: string;
  anio?: string;
};

export async function actualizarPerfilActual(
  cliente: SupabaseClient<BaseDatos>,
  valores: Record<string, unknown>
) {
  const {
    data: { user }
  } = await cliente.auth.getUser();

  if (!user) return { datos: null, error: "Sesión no válida." };

  return actualizarRegistro<Usuario>(cliente, "usuarios", user.id, valores);
}

export async function obtenerDocenteActual(cliente: SupabaseClient<BaseDatos>) {
  const {
    data: { user }
  } = await cliente.auth.getUser();

  if (!user) return null;

  const { data, error } = await cliente
    .from("docentes")
    .select("*")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Docente | null;
}

export async function actualizarDocentePerfil(
  cliente: SupabaseClient<BaseDatos>,
  docenteId: string,
  valores: Record<string, unknown>
) {
  return actualizarRegistro<Docente>(cliente, "docentes", docenteId, valores);
}

export async function listarTemarioDocente(cliente: SupabaseClient<BaseDatos>, docenteId: string) {
  const { data, error } = await cliente
    .from("temarios_docentes")
    .select("*")
    .eq("docente_id", docenteId)
    .order("creado_en", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as TemarioDocente[];
}

export function agregarMateriaTemario(
  cliente: SupabaseClient<BaseDatos>,
  valores: Record<string, unknown>
) {
  return crearRegistro<TemarioDocente>(cliente, "temarios_docentes", valores);
}

export function actualizarMateriaTemario(
  cliente: SupabaseClient<BaseDatos>,
  id: string,
  valores: Record<string, unknown>
) {
  return actualizarRegistro<TemarioDocente>(cliente, "temarios_docentes", id, valores);
}

export function eliminarMateriaTemario(cliente: SupabaseClient<BaseDatos>, id: string) {
  return eliminarRegistro(cliente, "temarios_docentes", id);
}

export async function listarGananciasDocente(
  cliente: SupabaseClient<BaseDatos>,
  docenteId: string,
  filtros: FiltrosGananciasDocente = {}
) {
  let consulta = cliente
    .from("liquidaciones")
    .select("*, tandas(*)")
    .eq("docente_id", docenteId)
    .order("creado_en", { ascending: false });

  if (filtros.tanda_id) {
    consulta = consulta.eq("tanda_id", filtros.tanda_id);
  }

  const anio = Number(filtros.anio);
  const mes = Number(filtros.mes);
  if (Number.isInteger(anio) && anio > 1900 && Number.isInteger(mes) && mes >= 1 && mes <= 12) {
    const desde = new Date(Date.UTC(anio, mes - 1, 1));
    const hasta = new Date(Date.UTC(anio, mes, 1));
    consulta = consulta.gte("creado_en", desde.toISOString()).lt("creado_en", hasta.toISOString());
  } else if (Number.isInteger(anio) && anio > 1900) {
    const desde = new Date(Date.UTC(anio, 0, 1));
    const hasta = new Date(Date.UTC(anio + 1, 0, 1));
    consulta = consulta.gte("creado_en", desde.toISOString()).lt("creado_en", hasta.toISOString());
  }

  const { data, error } = await consulta;
  if (error) throw new Error(error.message);
  return (data ?? []) as Array<Liquidacion & { tandas?: { id: string; nombre: string } | null }>;
}
