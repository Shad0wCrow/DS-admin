import type { SupabaseClient } from "@supabase/supabase-js";
import {
  actualizarRegistro,
  crearRegistro,
  listarRegistros
} from "@/lib/utilidades/crud-service";
import { subirArchivo } from "@/features/archivos/services/archivo-service";
import type { DocenteRegistro } from "@/features/docentes/types/docente-types";
import type { BaseDatos, Docente, EstadoGeneral, Usuario } from "@/lib/supabase/tipos-base-datos";
import { validarImagen } from "@/lib/validadores/archivos";

function obtenerArchivo(valor: unknown): File | null {
  if (typeof File !== "undefined" && valor instanceof File) return valor;
  if (!valor || typeof valor !== "object") return null;

  const posibleLista = valor as { length?: number; item?: (indice: number) => File | null; 0?: File };
  if (typeof posibleLista.length === "number" && posibleLista.length > 0) {
    return posibleLista.item?.(0) ?? posibleLista[0] ?? null;
  }

  return null;
}

async function prepararValoresDocente(
  cliente: SupabaseClient<BaseDatos>,
  valores: Record<string, unknown>
) {
  const usuarioId = typeof valores.usuario_id === "string" ? valores.usuario_id : "";
  if (!usuarioId) {
    return { datos: null, error: "Selecciona un usuario para vincular al docente." };
  }

  const foto = obtenerArchivo(valores.foto_url);
  const qr = obtenerArchivo(valores.qr_url);
  const datosDocente: Record<string, unknown> = { usuario_id: usuarioId };

  if (foto) {
    const errorImagen = validarImagen(foto);
    if (errorImagen) return { datos: null, error: errorImagen };

    const subida = await subirArchivo("archivos_docentes", foto, `usuarios/${usuarioId}/foto`);
    if (subida.error || !subida.ruta) {
      return { datos: null, error: subida.error ?? "No se pudo subir la fotografía." };
    }

    const { error: errorFoto } = await cliente
      .from("usuarios")
      .update({ foto_url: subida.ruta })
      .eq("id", usuarioId);
    if (errorFoto) return { datos: null, error: errorFoto.message };
  }

  if (qr) {
    const errorImagen = validarImagen(qr);
    if (errorImagen) return { datos: null, error: errorImagen };

    const subida = await subirArchivo("archivos_docentes", qr, `docentes/${usuarioId}/qr`);
    if (subida.error || !subida.ruta) {
      return { datos: null, error: subida.error ?? "No se pudo subir el QR." };
    }
    datosDocente.qr_url = subida.ruta;
  }

  return { datos: datosDocente, error: null };
}

export function listarDocentes(cliente: SupabaseClient<BaseDatos>) {
  return listarRegistros<DocenteRegistro>(cliente, "docentes", {
    columnas: "*, usuarios(*)",
    ordenarPor: "creado_en",
    ascendente: false
  });
}

export async function crearDocente(
  cliente: SupabaseClient<BaseDatos>,
  valores: Record<string, unknown>
) {
  const preparados = await prepararValoresDocente(cliente, valores);
  if (preparados.error || !preparados.datos) {
    return { datos: null, error: preparados.error };
  }

  return crearRegistro<Docente>(cliente, "docentes", preparados.datos);
}

export async function actualizarDocente(
  cliente: SupabaseClient<BaseDatos>,
  id: string,
  valores: Record<string, unknown>
) {
  const preparados = await prepararValoresDocente(cliente, valores);
  if (preparados.error || !preparados.datos) {
    return { datos: null, error: preparados.error };
  }

  return actualizarRegistro<Docente>(cliente, "docentes", id, preparados.datos);
}

async function cambiarEstadoUsuarioDocente(
  cliente: SupabaseClient<BaseDatos>,
  id: string,
  estado: EstadoGeneral
) {
  const { data, error } = await cliente
    .from("docentes")
    .select("usuario_id")
    .eq("id", id)
    .maybeSingle();

  if (error) return { datos: null, error: error.message };
  if (!data?.usuario_id) return { datos: null, error: "El docente no tiene usuario vinculado." };

  const resultado = await actualizarRegistro<Usuario>(cliente, "usuarios", data.usuario_id, {
    estado
  });
  if (resultado.error) return { datos: null, error: resultado.error };

  const docenteActualizado = await cliente
    .from("docentes")
    .select("*, usuarios(*)")
    .eq("id", id)
    .maybeSingle();

  if (docenteActualizado.error) {
    return { datos: null, error: docenteActualizado.error.message };
  }

  if (!docenteActualizado.data) {
    return {
      datos: null,
      error: "El docente se actualizó, pero RLS impidió leer la fila resultante."
    };
  }

  return { datos: docenteActualizado.data as Docente, error: null };
}

export function desactivarDocente(cliente: SupabaseClient<BaseDatos>, id: string) {
  return cambiarEstadoUsuarioDocente(cliente, id, "inactivo");
}

export function activarDocente(cliente: SupabaseClient<BaseDatos>, id: string) {
  return cambiarEstadoUsuarioDocente(cliente, id, "activo");
}
