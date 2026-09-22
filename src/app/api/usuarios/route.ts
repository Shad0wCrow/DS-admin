import { NextResponse, type NextRequest } from "next/server";
import {
  usuarioActualizarSchema,
  usuarioCrearSchema
} from "@/features/usuarios/schemas/usuario-schema";
import {
  convertirEnumsUsuarioAMayusculas,
  esErrorEnumInvalido,
  normalizarPerfilUsuario
} from "@/lib/autenticacion/perfil";
import { crearClienteAdministrativo } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { EstadoGeneral, Usuario } from "@/lib/supabase/tipos-base-datos";
import { rolesUsuario, type RolUsuario } from "@/lib/autenticacion/roles";

type UsuarioSolicitante = {
  rol: RolUsuario;
  estado: EstadoGeneral;
};

type ErrorSupabase = {
  code?: string;
  message: string;
};
type RespuestaSupabase<T> = {
  data: T | null;
  count?: number | null;
  error: ErrorSupabase | null;
};
type ConsultaUsuariosListado = {
  or: (filtro: string) => ConsultaUsuariosListado;
  eq: (columna: string, valor: string) => ConsultaUsuariosListado;
  order: (
    columna: string,
    opciones: { ascending: boolean }
  ) => {
    range: (desde: number, hasta: number) => Promise<RespuestaSupabase<Usuario[]>>;
  };
};
type TablaUsuariosFlexible = {
  insert: (perfil: Record<string, unknown>) => {
    select: () => { maybeSingle: () => Promise<RespuestaSupabase<Usuario>> };
  };
  update: (valores: Record<string, unknown>) => {
    eq: (columna: string, valor: string) => {
      select: () => { maybeSingle: () => Promise<RespuestaSupabase<Usuario>> };
    };
  };
  select: (columnas: string, opciones?: { count?: "exact" }) => ConsultaUsuariosListado;
};
type ClienteUsuariosFlexible = {
  from: (tabla: "usuarios") => TablaUsuariosFlexible;
};

function tablaUsuarios(admin: ReturnType<typeof crearClienteAdministrativo>) {
  return (admin as unknown as ClienteUsuariosFlexible).from("usuarios");
}

function puedeGestionarUsuarios(usuario: UsuarioSolicitante | null): usuario is UsuarioSolicitante {
  return Boolean(
    usuario?.estado === "activo" &&
      (usuario.rol === "superadmin" || usuario.rol === "admin")
  );
}

function telefonoNormalizado(telefono: string | null | undefined) {
  if (!telefono) return null;
  const valor = telefono.trim();
  return valor.length > 0 ? valor : null;
}

async function obtenerUsuarioSolicitante(userId: string) {
  const admin = crearClienteAdministrativo();
  const { data } = await admin
    .from("usuarios")
    .select("rol, estado")
    .eq("id", userId)
    .maybeSingle();

  return normalizarPerfilUsuario(data as { rol: RolUsuario; estado: EstadoGeneral } | null);
}

function validarGestionRol(
  usuarioActual: UsuarioSolicitante,
  usuarioObjetivo: Pick<Usuario, "id" | "rol" | "estado"> | null,
  nuevoRol: RolUsuario,
  nuevoEstado: EstadoGeneral,
  solicitanteId: string
) {
  if (usuarioActual.rol === "admin") {
    if (usuarioObjetivo?.rol === "superadmin" || nuevoRol === "superadmin") {
      return "Un administrador no puede gestionar cuentas SUPERADMIN.";
    }
  }

  if (
    usuarioObjetivo?.id === solicitanteId &&
    (usuarioObjetivo.rol !== nuevoRol || usuarioObjetivo.estado !== nuevoEstado)
  ) {
    return "No puedes cambiar tu propio rol o estado.";
  }

  return null;
}

async function correoDuplicado(
  admin: ReturnType<typeof crearClienteAdministrativo>,
  correo: string,
  ignorarId?: string
) {
  let consulta = admin.from("usuarios").select("id").eq("correo", correo);

  if (ignorarId) {
    consulta = consulta.neq("id", ignorarId);
  }

  const { data, error } = await consulta.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

async function insertarPerfilUsuario(
  admin: ReturnType<typeof crearClienteAdministrativo>,
  perfil: Record<string, unknown>
) {
  let resultado = await tablaUsuarios(admin).insert(perfil).select().maybeSingle();

  if (resultado.error && esErrorEnumInvalido(resultado.error as ErrorSupabase)) {
    resultado = await tablaUsuarios(admin)
      .insert(convertirEnumsUsuarioAMayusculas(perfil))
      .select()
      .maybeSingle();
  }

  return resultado;
}

async function actualizarPerfilUsuario(
  admin: ReturnType<typeof crearClienteAdministrativo>,
  id: string,
  valores: Record<string, unknown>
) {
  let resultado = await tablaUsuarios(admin).update(valores).eq("id", id).select().maybeSingle();

  if (resultado.error && esErrorEnumInvalido(resultado.error as ErrorSupabase)) {
    resultado = await tablaUsuarios(admin)
      .update(convertirEnumsUsuarioAMayusculas(valores))
      .eq("id", id)
      .select()
      .maybeSingle();
  }

  return resultado;
}

export async function GET(request: NextRequest) {
  const supabase = await crearClienteServidor();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }

  const usuarioActual = await obtenerUsuarioSolicitante(user.id);

  if (!puedeGestionarUsuarios(usuarioActual)) {
    return NextResponse.json({ error: "No tienes permiso para listar usuarios." }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const rol = searchParams.get("rol");
  const estado = searchParams.get("estado");
  const pagina = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limite = Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10));

  const desde = (pagina - 1) * limite;
  const hasta = desde + limite - 1;

  const admin = crearClienteAdministrativo();
  
  let consulta = tablaUsuarios(admin)
    .select("id, nombres, apellidos, correo, telefono, rol, estado, foto_url, creado_en, actualizado_en", { count: "exact" });

  if (q) {
    consulta = consulta.or(`nombres.ilike.%${q}%,apellidos.ilike.%${q}%,correo.ilike.%${q}%`);
  }
  if (rol && rolesUsuario.includes(rol as RolUsuario)) {
    consulta = consulta.eq("rol", rol);
  }
  if (estado === "activo" || estado === "inactivo") {
    consulta = consulta.eq("estado", estado);
  }

  const { data, count, error } = await consulta
    .order("creado_en", { ascending: false })
    .range(desde, hasta);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const usuarios = ((data as Usuario[]) ?? [])
    .map((usuario: Usuario) => normalizarPerfilUsuario(usuario))
    .filter((usuario): usuario is Usuario => Boolean(usuario));

  return NextResponse.json({ datos: usuarios, total: count ?? 0 });
}

export async function POST(request: NextRequest) {
  const supabase = await crearClienteServidor();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }

  const usuarioActual = await obtenerUsuarioSolicitante(user.id);

  if (!puedeGestionarUsuarios(usuarioActual)) {
    return NextResponse.json({ error: "No tienes permiso para crear usuarios." }, { status: 403 });
  }

  const cuerpo = await request.json();
  const validacion = usuarioCrearSchema.safeParse(cuerpo);

  if (!validacion.success) {
    return NextResponse.json(
      { error: validacion.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 422 }
    );
  }

  const errorRol = validarGestionRol(
    usuarioActual,
    null,
    validacion.data.rol,
    validacion.data.estado,
    user.id
  );

  if (errorRol) {
    return NextResponse.json({ error: errorRol }, { status: 403 });
  }

  const admin = crearClienteAdministrativo();
  const valores = validacion.data;

  try {
    if (await correoDuplicado(admin, valores.correo)) {
      return NextResponse.json({ error: "Ya existe un usuario con ese correo." }, { status: 409 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo validar el correo." },
      { status: 400 }
    );
  }

  const { data: auth, error: errorAuth } = await admin.auth.admin.createUser({
    email: valores.correo,
    password: valores.contrasena,
    email_confirm: true,
    user_metadata: {
      nombres: valores.nombres,
      apellidos: valores.apellidos,
      rol: valores.rol
    }
  });

  if (errorAuth || !auth.user) {
    return NextResponse.json(
      { error: errorAuth?.message ?? "No se pudo crear el usuario en Auth." },
      { status: 400 }
    );
  }

  const perfil = {
    correo: valores.correo,
    nombres: valores.nombres,
    apellidos: valores.apellidos,
    telefono: telefonoNormalizado(valores.telefono),
    rol: valores.rol,
    estado: valores.estado,
    foto_url: valores.foto_url ?? null,
    id: auth.user.id
  };
  const { data, error } = await insertarPerfilUsuario(admin, perfil);

  if (error) {
    await admin.auth.admin.deleteUser(auth.user.id);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    await admin.auth.admin.deleteUser(auth.user.id);
    return NextResponse.json(
      { error: "El usuario se creó, pero RLS impidió leer la fila resultante." },
      { status: 403 }
    );
  }

  return NextResponse.json({ datos: normalizarPerfilUsuario(data as Usuario) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await crearClienteServidor();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }

  const usuarioActual = await obtenerUsuarioSolicitante(user.id);

  if (!puedeGestionarUsuarios(usuarioActual)) {
    return NextResponse.json({ error: "No tienes permiso para editar usuarios." }, { status: 403 });
  }

  const cuerpo = await request.json();
  const id = typeof cuerpo.id === "string" ? cuerpo.id : "";

  if (!id) {
    return NextResponse.json({ error: "Usuario inválido." }, { status: 422 });
  }

  const admin = crearClienteAdministrativo();
  const { data: usuarioObjetivo, error: errorObjetivo } = await admin
    .from("usuarios")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (errorObjetivo) {
    return NextResponse.json({ error: errorObjetivo.message }, { status: 400 });
  }

  if (!usuarioObjetivo) {
    return NextResponse.json({ error: "El usuario no existe." }, { status: 404 });
  }

  const usuarioObjetivoRegistro = usuarioObjetivo as Usuario;
  const usuarioObjetivoNormalizado = normalizarPerfilUsuario(usuarioObjetivoRegistro);

  if (!usuarioObjetivoNormalizado) {
    return NextResponse.json({ error: "El usuario no tiene rol o estado válido." }, { status: 400 });
  }

  const validacion = usuarioActualizarSchema.safeParse({
    correo: usuarioObjetivoRegistro.correo,
    nombres: usuarioObjetivoRegistro.nombres,
    apellidos: usuarioObjetivoRegistro.apellidos,
    telefono: usuarioObjetivoRegistro.telefono,
    foto_url: usuarioObjetivoRegistro.foto_url,
    rol: usuarioObjetivoNormalizado.rol,
    estado: usuarioObjetivoNormalizado.estado,
    contrasena: "",
    ...cuerpo
  });

  if (!validacion.success) {
    return NextResponse.json(
      { error: validacion.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 422 }
    );
  }

  const valores = validacion.data;
  const errorRol = validarGestionRol(
    usuarioActual,
    usuarioObjetivoNormalizado,
    valores.rol,
    valores.estado,
    user.id
  );

  if (errorRol) {
    return NextResponse.json({ error: errorRol }, { status: 403 });
  }

  try {
    if (await correoDuplicado(admin, valores.correo, id)) {
      return NextResponse.json({ error: "Ya existe un usuario con ese correo." }, { status: 409 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo validar el correo." },
      { status: 400 }
    );
  }

  const actualizacionAuth = {
    email: valores.correo,
    user_metadata: {
      nombres: valores.nombres,
      apellidos: valores.apellidos,
      rol: valores.rol
    },
    ...(valores.contrasena ? { password: valores.contrasena } : {})
  };

  const { error: errorAuth } = await admin.auth.admin.updateUserById(id, actualizacionAuth);

  if (errorAuth) {
    return NextResponse.json({ error: errorAuth.message }, { status: 400 });
  }

  const { data, error } = await actualizarPerfilUsuario(admin, id, {
    correo: valores.correo,
    nombres: valores.nombres,
    apellidos: valores.apellidos,
    telefono: telefonoNormalizado(valores.telefono),
    rol: valores.rol,
    estado: valores.estado,
    foto_url: valores.foto_url ?? null
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "El usuario se actualizó, pero RLS impidió leer la fila resultante." },
      { status: 403 }
    );
  }

  return NextResponse.json({ datos: normalizarPerfilUsuario(data as Usuario) });
}
