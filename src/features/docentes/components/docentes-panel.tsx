"use client";

import { useMemo } from "react";
import { Insignia } from "@/components/ui/insignia";
import { PanelCrud } from "@/components/common/panel-crud";
import { obtenerCamposDocente, valoresInicialesDocente } from "@/features/docentes/forms/docente-form";
import { usarDocentes } from "@/features/docentes/hooks/usar-docentes";
import { docenteSchema } from "@/features/docentes/schemas/docente-schema";
import type { DocenteRegistro } from "@/features/docentes/types/docente-types";
import { usarUsuarios } from "@/features/usuarios/hooks/usar-usuarios";

export function DocentesPanel() {
  const { docentes, cargando, refrescar, crear, actualizar, desactivar, activar } = usarDocentes();
  const usuarios = usarUsuarios({ limite: 100 });

  const opcionesUsuarios = useMemo(
    () =>
      usuarios.usuarios.map((usuario) => ({
        etiqueta: `${usuario.nombres} ${usuario.apellidos} - ${usuario.correo}`,
        valor: usuario.id
      })),
    [usuarios.usuarios]
  );

  const campos = useMemo(() => obtenerCamposDocente(opcionesUsuarios), [opcionesUsuarios]);

  return (
    <PanelCrud<DocenteRegistro>
      titulo="Docentes"
      descripcion="Vincula usuarios docentes y administra fotografía de perfil y QR de pago."
      campos={campos}
      columnas={[
        {
          clave: "nombre",
          titulo: "Docente",
          renderizar: (docente) =>
            docente.usuarios
              ? `${docente.usuarios.nombres} ${docente.usuarios.apellidos}`
              : "Sin usuario"
        },
        {
          clave: "correo",
          titulo: "Correo",
          renderizar: (docente) => docente.usuarios?.correo ?? "Sin correo"
        },
        {
          clave: "telefono",
          titulo: "Teléfono",
          renderizar: (docente) => docente.usuarios?.telefono ?? "Sin teléfono"
        },
        {
          clave: "foto",
          titulo: "Foto",
          renderizar: (docente) => (docente.usuarios?.foto_url ? "Cargada" : "Sin foto")
        },
        {
          clave: "qr",
          titulo: "QR",
          renderizar: (docente) => (docente.qr_url ? "Cargado" : "Sin QR")
        },
        {
          clave: "estado",
          titulo: "Estado",
          renderizar: (docente) => (
            <Insignia tono={docente.usuarios?.estado === "activo" ? "exito" : "peligro"}>
              {docente.usuarios?.estado ?? "inactivo"}
            </Insignia>
          )
        }
      ]}
      datos={docentes}
      cargando={cargando || usuarios.cargando}
      esquema={docenteSchema}
      valoresIniciales={valoresInicialesDocente}
      etiquetaCrear="Nuevo docente"
      crear={crear}
      actualizar={actualizar}
      desactivar={desactivar}
      activar={activar}
      obtenerEstado={(docente) => docente.usuarios?.estado ?? "inactivo"}
      refrescar={refrescar}
    />
  );
}
