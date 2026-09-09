import { Tarjeta } from "@/components/ui/tarjeta";

type ColumnaTabla<T> = {
  clave: string;
  titulo: string;
  renderizar: (fila: T) => React.ReactNode;
};

type TablaDatosProps<T> = {
  columnas: ColumnaTabla<T>[];
  datos: T[];
  obtenerClave: (fila: T) => string;
  vacio?: string;
  total?: number;
  paginaActual?: number;
  limite?: number;
  alCambiarPagina?: (nuevaPagina: number) => void;
  cargando?: boolean;
};

export function TablaDatos<T>({
  columnas,
  datos,
  obtenerClave,
  vacio,
  total = 0,
  paginaActual = 1,
  limite = 20,
  alCambiarPagina,
  cargando = false
}: TablaDatosProps<T>) {
  const totalPaginas = Math.ceil(total / limite) || 1;
  const desde = total === 0 ? 0 : (paginaActual - 1) * limite + 1;
  const hasta = Math.min(paginaActual * limite, total);

  const tieneAnterior = paginaActual > 1;
  const tieneSiguiente = paginaActual < totalPaginas;

  return (
    <Tarjeta className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--color-panel-suave)] text-xs uppercase text-[var(--color-texto-secundario)]">
            <tr>
              {columnas.map((columna) => (
                <th key={columna.clave} className="whitespace-nowrap px-4 py-3 font-semibold">
                  {columna.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td
                  className="px-4 py-8 text-center text-sm text-[var(--color-texto-secundario)]"
                  colSpan={columnas.length}
                >
                  Cargando registros...
                </td>
              </tr>
            ) : datos.length > 0 ? (
              datos.map((fila) => (
                <tr
                  key={obtenerClave(fila)}
                  className="border-t border-[var(--color-borde)] text-[var(--color-texto)]"
                >
                  {columnas.map((columna) => (
                    <td key={columna.clave} className="whitespace-nowrap px-4 py-3">
                      {columna.renderizar(fila)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-4 py-8 text-center text-sm text-[var(--color-texto-secundario)]"
                  colSpan={columnas.length}
                >
                  {vacio ?? "Sin registros"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {alCambiarPagina && total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-borde)] px-4 py-3 text-xs text-[var(--color-texto-secundario)]">
          <div>
            Mostrando <span className="font-medium text-[var(--color-texto)]">{desde}</span> a{" "}
            <span className="font-medium text-[var(--color-texto)]">{hasta}</span> de{" "}
            <span className="font-medium text-[var(--color-texto)]">{total}</span> registros
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alCambiarPagina(paginaActual - 1)}
              disabled={!tieneAnterior || cargando}
              className="rounded border border-[var(--color-borde)] px-3 py-1 hover:bg-[var(--color-panel-suave)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span>
              Página <strong className="text-[var(--color-texto)]">{paginaActual}</strong> de{" "}
              <strong className="text-[var(--color-texto)]">{totalPaginas}</strong>
            </span>
            <button
              type="button"
              onClick={() => alCambiarPagina(paginaActual + 1)}
              disabled={!tieneSiguiente || cargando}
              className="rounded border border-[var(--color-borde)] px-3 py-1 hover:bg-[var(--color-panel-suave)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </Tarjeta>
  );
}