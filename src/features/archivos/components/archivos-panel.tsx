"use client";

import { Download, Eye, RotateCcw, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EncabezadoPagina } from "@/components/common/encabezado-pagina";
import { EstadoCarga } from "@/components/common/estado-carga";
import { Boton } from "@/components/ui/boton";
import { Campo, Selector } from "@/components/ui/campo";
import { Tarjeta } from "@/components/ui/tarjeta";
import { TablaDatos } from "@/components/ui/tabla-datos";
import { usarArchivos } from "@/features/archivos/hooks/usar-archivos";
import type { ArchivoStorage, BucketArchivo } from "@/features/archivos/services/archivo-service";
import { formatearFechaHora } from "@/lib/utilidades/formato";
import { validarComprobante, validarImagen } from "@/lib/validadores/archivos";

const buckets: Array<{ etiqueta: string; valor: BucketArchivo }> = [
  { etiqueta: "Archivos docentes", valor: "archivos_docentes" },
  { etiqueta: "Comprobantes de pago", valor: "comprobantes_pago" }
];

function formatearTamano(bytes: number | null) {
  if (!bytes) return "Sin tamaño";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ArchivosPanel() {
  const [bucket, setBucket] = useState<BucketArchivo>("archivos_docentes");
  const [carpeta, setCarpeta] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const archivos = usarArchivos(bucket, carpeta.trim());

  async function manejarSubida() {
    if (!archivo) {
      toast.error("Selecciona un archivo.");
      return;
    }

    const errorArchivo =
      bucket === "archivos_docentes" ? validarImagen(archivo) : validarComprobante(archivo);
    if (errorArchivo) {
      toast.error(errorArchivo);
      return;
    }

    setSubiendo(true);
    const resultado = await archivos.subir(bucket, archivo, carpeta.trim());
    setSubiendo(false);

    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }

    toast.success("Archivo subido.");
    setArchivo(null);
    archivos.refrescar();
  }

  async function abrirArchivo(fila: ArchivoStorage) {
    if (!fila.tamano && !fila.tipo) {
      setCarpeta(fila.ruta);
      return;
    }

    const resultado = await archivos.firmar(fila.bucket, fila.ruta);
    if (resultado.error || !resultado.url) {
      toast.error(resultado.error ?? "No se pudo abrir el archivo.");
      return;
    }
    window.open(resultado.url, "_blank", "noopener,noreferrer");
  }

  async function eliminar(fila: ArchivoStorage) {
    const resultado = await archivos.eliminar(fila.bucket, fila.ruta);
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }
    toast.success("Archivo eliminado.");
    archivos.refrescar();
  }

  return (
    <div className="grid gap-6">
      <EncabezadoPagina
        titulo="Archivos"
        descripcion="Gestión de objetos almacenados en Supabase Storage."
        acciones={
          <Boton variante="secundario" onClick={archivos.refrescar}>
            <RotateCcw className="h-4 w-4" />
            Actualizar
          </Boton>
        }
      />

      <Tarjeta className="p-5">
        <div className="grid gap-4 md:grid-cols-[220px_1fr_1fr_auto]">
          <Selector
            etiqueta="Bucket"
            value={bucket}
            onChange={(evento) => setBucket(evento.target.value as BucketArchivo)}
            opciones={buckets}
          />
          <Campo
            etiqueta="Carpeta"
            placeholder="general, inscripciones, docentes/..."
            value={carpeta}
            onChange={(evento) => setCarpeta(evento.target.value)}
          />
          <Campo
            etiqueta="Archivo"
            type="file"
            accept={
              bucket === "archivos_docentes"
                ? "image/png,image/jpeg,image/webp"
                : "image/png,image/jpeg,image/webp,application/pdf"
            }
            onChange={(evento) => setArchivo(evento.target.files?.[0] ?? null)}
          />
          <Boton type="button" onClick={manejarSubida} cargando={subiendo} className="md:mt-7">
            <Upload className="h-4 w-4" />
            Subir
          </Boton>
        </div>
      </Tarjeta>

      {archivos.cargando ? (
        <EstadoCarga />
      ) : (
        <TablaDatos
          columnas={[
            { clave: "nombre", titulo: "Archivo", renderizar: (fila) => fila.nombre },
            { clave: "ruta", titulo: "Ruta", renderizar: (fila) => fila.ruta },
            { clave: "tipo", titulo: "Tipo", renderizar: (fila) => fila.tipo ?? "Sin tipo" },
            {
              clave: "tamano",
              titulo: "Tamaño",
              renderizar: (fila) => formatearTamano(fila.tamano)
            },
            {
              clave: "actualizado",
              titulo: "Actualizado",
              renderizar: (fila) => formatearFechaHora(fila.actualizado_en)
            },
            {
              clave: "acciones",
              titulo: "Acciones",
              renderizar: (fila) => (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-borde)] hover:bg-[var(--color-panel-suave)]"
                    title="Abrir"
                    aria-label="Abrir"
                    onClick={() => abrirArchivo(fila)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-borde)] hover:bg-[var(--color-panel-suave)]"
                    title="Descargar"
                    aria-label="Descargar"
                    onClick={() => abrirArchivo(fila)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-borde)] text-[var(--color-peligro)] hover:bg-[var(--color-panel-suave)]"
                    title="Eliminar"
                    aria-label="Eliminar"
                    onClick={() => eliminar(fila)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            }
          ]}
          datos={archivos.archivos}
          obtenerClave={(fila) => fila.ruta}
          vacio="Sin archivos en esta carpeta"
        />
      )}
    </div>
  );
}