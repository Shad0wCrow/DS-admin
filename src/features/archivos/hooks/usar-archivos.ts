"use client";

import { useQuery } from "@tanstack/react-query";
import {
  crearUrlFirmada,
  eliminarArchivo,
  listarArchivos,
  subirArchivo,
  type BucketArchivo
} from "@/features/archivos/services/archivo-service";

export function usarArchivos(bucket: BucketArchivo = "archivos_docentes", carpeta = "") {
  const consulta = useQuery({
    queryKey: ["archivos-storage", bucket, carpeta],
    queryFn: () => listarArchivos(bucket, carpeta)
  });

  return {
    archivos: consulta.data ?? [],
    cargando: consulta.isLoading,
    refrescar: () => void consulta.refetch(),
    subir: (bucketDestino: BucketArchivo, archivo: File, carpetaDestino: string) =>
      subirArchivo(bucketDestino, archivo, carpetaDestino),
    firmar: (bucketDestino: BucketArchivo, ruta: string) => crearUrlFirmada(bucketDestino, ruta),
    eliminar: (bucketDestino: BucketArchivo, ruta: string) => eliminarArchivo(bucketDestino, ruta)
  };
}
