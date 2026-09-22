"use client";

import { crearClienteNavegador } from "@/lib/supabase/cliente";

export type BucketArchivo = "archivos_docentes" | "comprobantes_pago";

export type ArchivoStorage = {
  bucket: BucketArchivo;
  ruta: string;
  nombre: string;
  tamano: number | null;
  tipo: string | null;
  actualizado_en: string | null;
};

function limpiarRuta(ruta: string): string {
  return ruta.trim().replace(/^\/+|\/+$/g, "");
}

export async function subirArchivo(bucket: BucketArchivo, archivo: File, carpeta: string) {
  const supabase = crearClienteNavegador();
  const extension = archivo.name.split(".").pop() ?? "bin";
  const carpetaLimpia = limpiarRuta(carpeta);
  const nombreArchivo = `${crypto.randomUUID()}.${extension}`;
  const ruta = carpetaLimpia ? `${carpetaLimpia}/${nombreArchivo}` : nombreArchivo;

  const { error } = await supabase.storage.from(bucket).upload(ruta, archivo, {
    upsert: false,
    contentType: archivo.type
  });

  if (error) {
    return { ruta: null, error: error.message };
  }

  return { ruta, error: null };
}

export async function listarArchivos(bucket: BucketArchivo, carpeta = "") {
  const supabase = crearClienteNavegador();
  const carpetaLimpia = limpiarRuta(carpeta);

  const { data, error } = await supabase.storage.from(bucket).list(carpetaLimpia || undefined, {
    limit: 100,
    sortBy: { column: "updated_at", order: "desc" }
  });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((archivo) => archivo.name !== ".emptyFolderPlaceholder")
    .map<ArchivoStorage>((archivo) => {
      const ruta = carpetaLimpia ? `${carpetaLimpia}/${archivo.name}` : archivo.name;
      return {
        bucket,
        ruta,
        nombre: archivo.name,
        tamano: typeof archivo.metadata?.size === "number" ? archivo.metadata.size : null,
        tipo:
          typeof archivo.metadata?.mimetype === "string" ? archivo.metadata.mimetype : null,
        actualizado_en: archivo.updated_at ?? archivo.created_at ?? null
      };
    });
}
export async function crearUrlFirmada(bucket: BucketArchivo, ruta: string) {
  const supabase = crearClienteNavegador();
  const rutaLimpia = limpiarRuta(ruta).replace(new RegExp(`^${bucket}\/`), "");

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(rutaLimpia, 60 * 10);

  if (error) return { url: null, error: error.message };
  return { url: data.signedUrl, error: null };
}

export async function eliminarArchivo(bucket: BucketArchivo, ruta: string) {
  const supabase = crearClienteNavegador();
  const rutaLimpia = limpiarRuta(ruta).replace(new RegExp(`^${bucket}\/`), "");

  const { error } = await supabase.storage.from(bucket).remove([rutaLimpia]);

  if (error) return { datos: null, error: error.message };
  return { datos: true, error: null };
}