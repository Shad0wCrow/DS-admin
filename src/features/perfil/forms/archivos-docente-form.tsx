"use client";

import { ImageUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Boton } from "@/components/ui/boton";
import { Campo } from "@/components/ui/campo";
import { subirArchivo } from "@/features/archivos/services/archivo-service";
import { usarPerfilDocente } from "@/features/perfil/hooks/usar-perfil";
import { validarImagen } from "@/lib/validadores/archivos";

export function ArchivosDocenteForm() {
  const perfil = usarPerfilDocente();
  const [fotografia, setFotografia] = useState<File | null>(null);
  const [qr, setQr] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);

  if (!perfil.docente) return null;

  async function manejarSubida() {
    if (!perfil.docente) return;
    setCargando(true);

    const valoresDocente: Record<string, unknown> = {};
    const valoresUsuario: Record<string, unknown> = {};

    for (const [archivo, campo, carpeta] of [
      [fotografia, "foto_url", "fotografias"],
      [qr, "qr_url", "qr"]
    ] as const) {
      if (!archivo) continue;
      const errorArchivo = validarImagen(archivo);
      if (errorArchivo) {
        toast.error(errorArchivo);
        setCargando(false);
        return;
      }
      const subida = await subirArchivo("archivos_docentes", archivo, carpeta);
      if (subida.error) {
        toast.error(subida.error);
        setCargando(false);
        return;
      }
      if (campo === "foto_url") {
        valoresUsuario.foto_url = subida.ruta;
      } else {
        valoresDocente.qr_url = subida.ruta;
      }
    }

    const resultadoUsuario =
      Object.keys(valoresUsuario).length > 0
        ? await perfil.actualizarPerfil(valoresUsuario)
        : { error: null };
    const resultadoDocente =
      Object.keys(valoresDocente).length > 0
        ? await perfil.actualizarDocente(perfil.docente.id, valoresDocente)
        : { error: null };
    setCargando(false);

    if (resultadoUsuario.error || resultadoDocente.error) {
      toast.error(resultadoUsuario.error ?? resultadoDocente.error ?? "No se pudieron actualizar los archivos.");
      return;
    }
    toast.success("Archivos actualizados.");
    perfil.refrescar();
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Campo
        etiqueta="Fotografía"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(evento) => setFotografia(evento.target.files?.[0] ?? null)}
      />
      <Campo
        etiqueta="QR de pago"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(evento) => setQr(evento.target.files?.[0] ?? null)}
      />
      <div className="md:col-span-2">
        <Boton type="button" onClick={manejarSubida} cargando={cargando}>
          <ImageUp className="h-4 w-4" />
          Subir archivos
        </Boton>
      </div>
    </div>
  );
}
