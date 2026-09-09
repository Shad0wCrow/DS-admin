"use client";

import { Edit, Plus, Power, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EncabezadoPagina } from "@/components/common/encabezado-pagina";
import { EstadoCarga } from "@/components/common/estado-carga";
import { CampoFormulario, FormularioEntidad } from "@/components/common/formulario-entidad";
import { Boton } from "@/components/ui/boton";
import { Tarjeta } from "@/components/ui/tarjeta";
import { TablaDatos } from "@/components/ui/tabla-datos";

type ColumnaPanel<T> = {
  clave: string;
  titulo: string;
  renderizar: (fila: T) => React.ReactNode;
};

type PanelCrudProps<T extends { id: string }> = {
  titulo: string;
  descripcion: string;
  campos: CampoFormulario[];
  columnas: ColumnaPanel<T>[];
  datos: T[];
  cargando?: boolean;
  total?: number;
  paginaActual?: number;
  limite?: number;
  alCambiarPagina?: (nuevaPagina: number) => void;
  esquema: Parameters<typeof FormularioEntidad>[0]["esquema"];
  esquemaCrear?: Parameters<typeof FormularioEntidad>[0]["esquema"];
  esquemaEditar?: Parameters<typeof FormularioEntidad>[0]["esquema"];
  valoresIniciales: Record<string, unknown>;
  etiquetaCrear: string;
  crear: (valores: Record<string, unknown>) => Promise<{ error: string | null }>;
  actualizar: (id: string, valores: Record<string, unknown>) => Promise<{ error: string | null }>;
  desactivar?: (id: string) => Promise<{ error: string | null }>;
  activar?: (id: string) => Promise<{ error: string | null }>;
  obtenerEstado?: (fila: T) => "activo" | "inactivo";
  herramientas?: React.ReactNode;
  refrescar: () => void;
};

export function PanelCrud<T extends { id: string }>({
  titulo,
  descripcion,
  campos,
  columnas,
  datos,
  cargando = false,
  total,
  paginaActual,
  limite,
  alCambiarPagina,
  esquema,
  esquemaCrear,
  esquemaEditar,
  valoresIniciales,
  etiquetaCrear,
  crear,
  actualizar,
  desactivar,
  activar,
  obtenerEstado,
  herramientas,
  refrescar
}: PanelCrudProps<T>) {
  const [registroActivo, setRegistroActivo] = useState<T | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const valoresEdicion = useMemo(() => {
    if (!registroActivo) return valoresIniciales;

    return campos.reduce<Record<string, unknown>>((acumulado, campo) => {
      if (campo.tipo === "archivo") {
        acumulado[campo.nombre] = "";
        return acumulado;
      }
      acumulado[campo.nombre] = (registroActivo as Record<string, unknown>)[campo.nombre] ?? "";
      return acumulado;
    }, {});
  }, [campos, registroActivo, valoresIniciales]);

  async function manejarSubmit(valores: Record<string, unknown>) {
    const resultado = registroActivo
      ? await actualizar(registroActivo.id, valores)
      : await crear(valores);

    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }

    toast.success(registroActivo ? "Registro actualizado." : "Registro creado.");
    setRegistroActivo(null);
    setMostrarFormulario(false);
    refrescar();
  }

  async function manejarDesactivar(id: string) {
    if (!desactivar) return;
    const resultado = await desactivar(id);
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }
    toast.success("Registro desactivado.");
    refrescar();
  }

  async function manejarActivar(id: string) {
    if (!activar) return;
    const resultado = await activar(id);
    if (resultado.error) {
      toast.error(resultado.error);
      return;
    }
    toast.success("Registro activado.");
    refrescar();
  }

  const columnasConAcciones = [
    ...columnas,
    {
      clave: "acciones",
      titulo: "Acciones",
      renderizar: (fila: T) => {
        const estado = obtenerEstado?.(fila);
        const estaInactivo = estado === "inactivo";

        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-borde)] hover:bg-[var(--color-panel-suave)]"
              title="Editar"
              aria-label="Editar"
              onClick={() => {
                setRegistroActivo(fila);
                setMostrarFormulario(true);
              }}
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            {activar && estaInactivo ? (
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-borde)] text-[var(--color-exito)] hover:bg-[var(--color-panel-suave)]"
                title="Activar"
                aria-label="Activar"
                onClick={() => manejarActivar(fila.id)}
              >
                <Power className="h-3.5 w-3.5" />
              </button>
            ) : null}
            {desactivar && !estaInactivo ? (
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-borde)] text-[var(--color-peligro)] hover:bg-[var(--color-panel-suave)]"
                title="Desactivar"
                aria-label="Desactivar"
                onClick={() => manejarDesactivar(fila.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        );
      }
    }
  ];

  return (
    <div className="grid gap-6">
      <EncabezadoPagina
        titulo={titulo}
        descripcion={descripcion}
        acciones={
          <>
            <Boton variante="secundario" onClick={refrescar}>
              <RotateCcw className="h-4 w-4" />
              Actualizar
            </Boton>
            <Boton
              onClick={() => {
                setRegistroActivo(null);
                setMostrarFormulario((valor) => !valor);
              }}
            >
              <Plus className="h-4 w-4" />
              {etiquetaCrear}
            </Boton>
          </>
        }
      />

      {mostrarFormulario ? (
        <Tarjeta className="p-5">
          <h2 className="mb-4 text-base font-semibold text-[var(--color-texto)]">
            {registroActivo ? "Editar registro" : "Nuevo registro"}
          </h2>
          <FormularioEntidad
            esquema={registroActivo ? esquemaEditar ?? esquema : esquemaCrear ?? esquema}
            campos={campos}
            valoresIniciales={valoresEdicion}
            textoBoton={registroActivo ? "Actualizar" : "Guardar"}
            onSubmit={manejarSubmit}
          />
        </Tarjeta>
      ) : null}

      {herramientas ? <Tarjeta className="p-4">{herramientas}</Tarjeta> : null}

      {cargando ? (
        <EstadoCarga />
      ) : (
        <TablaDatos
          columnas={columnasConAcciones}
          datos={datos}
          obtenerClave={(fila) => fila.id}
          vacio="No hay registros para mostrar"
          total={total}
          paginaActual={paginaActual}
          limite={limite}
          alCambiarPagina={alCambiarPagina}
        />
      )}
    </div>
  );
}
