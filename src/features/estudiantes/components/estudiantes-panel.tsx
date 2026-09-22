"use client";

import { PanelCrud } from "@/components/common/panel-crud";
import {
  camposEstudiante,
  valoresInicialesEstudiante
} from "@/features/estudiantes/forms/estudiante-form";
import { usarEstudiantes } from "@/features/estudiantes/hooks/usar-estudiantes";
import { estudianteSchema } from "@/features/estudiantes/schemas/estudiante-schema";
import type { EstudianteRegistro } from "@/features/estudiantes/types/estudiante-types";

export function EstudiantesPanel() {
  const estudiantesHook = usarEstudiantes();
  const listaEstudiantes = estudiantesHook.estudiantes as EstudianteRegistro[];

  return (
    <PanelCrud<EstudianteRegistro>
      titulo="Estudiantes"
      descripcion="Registro y administración de estudiantes inscritos o disponibles para nuevas inscripciones."
      campos={camposEstudiante}
      columnas={[
        {
          clave: "nombre",
          titulo: "Estudiante",
          renderizar: (estudiante) => `${estudiante.nombres ?? ""} ${estudiante.apellidos ?? ""}`.trim() || "Sin nombre"
        },
        {
          clave: "correo",
          titulo: "Correo",
          renderizar: (estudiante) => estudiante.correo ?? "Sin correo"
        },
        {
          clave: "telefono",
          titulo: "Teléfono",
          renderizar: (estudiante) => estudiante.telefono ?? "Sin teléfono"
        }
      ]}
      datos={listaEstudiantes}
      cargando={Boolean(estudiantesHook.cargando)}
      esquema={estudianteSchema}
      valoresIniciales={valoresInicialesEstudiante}
      etiquetaCrear="Nuevo estudiante"
      crear={estudiantesHook.crear}
      actualizar={estudiantesHook.actualizar}
      refrescar={estudiantesHook.refrescar}
    />
  );
}
