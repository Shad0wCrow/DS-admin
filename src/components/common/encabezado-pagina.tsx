type EncabezadoPaginaProps = {
  titulo: string;
  descripcion?: string;
  acciones?: React.ReactNode;
};

export function EncabezadoPagina({ titulo, descripcion, acciones }: EncabezadoPaginaProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--color-borde)] pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-[var(--color-texto)]">
          {titulo}
        </h1>
        {descripcion ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-texto-secundario)]">
            {descripcion}
          </p>
        ) : null}
      </div>
      {acciones ? <div className="flex flex-wrap items-center gap-2">{acciones}</div> : null}
    </header>
  );
}
