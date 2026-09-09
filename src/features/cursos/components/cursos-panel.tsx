"use client";

import { PanelCrud } from "@/components/common/panel-crud";
import { Insignia } from "@/components/ui/insignia";
import { obtenerCamposCurso, valoresInicialesCurso } from "@/features/cursos/forms/curso-form";
import { usarCursos } from "@/features/cursos/hooks/usar-cursos";
import { cursoSchema } from "@/features/cursos/schemas/curso-schema";
import type { CursoRegistro } from "@/features/cursos/types/curso-types";
import { formatearMoneda } from "@/lib/utilidades/formato";

export function CursosPanel() {
  const cursos = usarCursos();
  const campos = obtenerCamposCurso();
  const listaCursos = cursos.cursos as CursoRegistro[];

  return (
    <PanelCrud<CursoRegistro>
      titulo="Cursos"
      descripcion="Administración de cursos, precios, duración y estado."
      campos={campos}
      columnas={[
        { clave: "nombre", titulo: "Curso", renderizar: (curso) => curso.nombre },
        { clave: "duracion", titulo: "Duración", renderizar: (curso) => curso.duracion },
        { clave: "precio", titulo: "Precio", renderizar: (curso) => formatearMoneda(curso.precio) },
        {
          clave: "estado",
          titulo: "Estado",
          renderizar: (curso) => {
            const activo = curso.activo;
            return (
              <Insignia tono={activo ? "exito" : "peligro"}>
                {activo ? "activo" : "inactivo"}
              </Insignia>
            );
          }
        }
      ]}
      datos={listaCursos}
      cargando={Boolean(cursos.cargando)}
      esquema={cursoSchema}
      valoresIniciales={valoresInicialesCurso}
      etiquetaCrear="Nuevo curso"
      crear={cursos.crear}
      actualizar={cursos.actualizar}
      desactivar={cursos.desactivar}
      activar={cursos.activar}
      obtenerEstado={(curso) => (curso.activo ? "activo" : "inactivo")}
      refrescar={cursos.refrescar}
    />
  );
}
