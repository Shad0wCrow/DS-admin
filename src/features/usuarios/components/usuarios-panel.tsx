"use client";

import { useEffect, useState } from "react";
import { PanelCrud } from "@/components/common/panel-crud";
import { Campo, Selector } from "@/components/ui/campo";
import { Insignia } from "@/components/ui/insignia";
import {
  camposUsuario,
  rolUsuarioOpciones,
  valoresInicialesUsuario
} from "@/features/usuarios/forms/usuario-form";
import { usarUsuarios } from "@/features/usuarios/hooks/usar-usuarios";
import type { ParametrosListarUsuarios } from "@/features/usuarios/services/usuario-service";
import {
  usuarioActualizarSchema,
  usuarioCrearSchema,
  usuarioSchema
} from "@/features/usuarios/schemas/usuario-schema";
import type { UsuarioRegistro } from "@/features/usuarios/types/usuario-types";
import { etiquetasRol } from "@/lib/autenticacion/roles";
import { estadoGeneralOpciones } from "@/lib/validadores/comunes";

export function UsuariosPanel() {
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [pagina, setPagina] = useState(1);
  const [rol, setRol] = useState<ParametrosListarUsuarios["rol"]>("todos");
  const [estado, setEstado] = useState<ParametrosListarUsuarios["estado"]>("todos");

  // 1. Debounce de 300ms para enviar la búsqueda a Supabase sin saturar
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setPagina(1);
    }, 300);

    return () => clearTimeout(temporizador);
  }, [busqueda]);

  const usuarios = usarUsuarios({
    busqueda: busquedaDebounced,
    rol,
    estado,
    pagina,
    limite: 20
  });

  return (
    <PanelCrud<UsuarioRegistro>
      titulo="Usuarios"
      descripcion="Administración de perfiles, roles y estados de acceso al sistema."
      campos={camposUsuario}
      columnas={[
        {
          clave: "nombre",
          titulo: "Usuario",
          renderizar: (usuario) => `${usuario.nombres} ${usuario.apellidos}`
        },
        { clave: "correo", titulo: "Correo", renderizar: (usuario) => usuario.correo },
        { clave: "rol", titulo: "Rol", renderizar: (usuario) => etiquetasRol[usuario.rol] },
        {
          clave: "estado",
          titulo: "Estado",
          renderizar: (usuario) => (
            <Insignia tono={usuario.estado === "activo" ? "exito" : "peligro"}>
              {usuario.estado}
            </Insignia>
          )
        }
      ]}
      datos={usuarios?.usuarios ?? []}
      total={usuarios?.total ?? 0}
      paginaActual={pagina}
      limite={20}
      alCambiarPagina={(nuevaPagina) => setPagina(nuevaPagina)}
      cargando={usuarios?.cargando}
      esquema={usuarioSchema}
      esquemaCrear={usuarioCrearSchema}
      esquemaEditar={usuarioActualizarSchema}
      valoresIniciales={valoresInicialesUsuario}
      etiquetaCrear="Nuevo usuario"
      crear={usuarios?.crear}
      actualizar={usuarios?.actualizar}
      desactivar={usuarios?.desactivar}
      activar={usuarios?.activar}
      obtenerEstado={(usuario) => usuario.estado}
      herramientas={
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_180px]">
          <Campo
            etiqueta="Buscar"
            placeholder="Nombre o correo"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
          <Selector
            etiqueta="Rol"
            value={rol}
            onChange={(evento) => {
              setRol(evento.target.value as ParametrosListarUsuarios["rol"]);
              setPagina(1);
            }}
            opciones={[{ etiqueta: "Todos", valor: "todos" }, ...rolUsuarioOpciones]}
          />
          <Selector
            etiqueta="Estado"
            value={estado}
            onChange={(evento) => {
              setEstado(evento.target.value as ParametrosListarUsuarios["estado"]);
              setPagina(1);
            }}
            opciones={[{ etiqueta: "Todos", valor: "todos" }, ...estadoGeneralOpciones]}
          />
        </div>
      }
      refrescar={usuarios?.refrescar}
    />
  );
}
