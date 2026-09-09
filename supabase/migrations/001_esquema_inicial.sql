create extension if not exists pgcrypto;

do $$
begin
  create type public.rol_usuario as enum ('superadmin', 'administrador', 'docente');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.estado_general as enum ('activo', 'inactivo');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.estado_tanda as enum ('planificada', 'abierta', 'cerrada', 'cancelada');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.estado_liquidacion as enum ('pendiente', 'pagada', 'anulada');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.estado_pago as enum ('registrado', 'anulado');
exception when duplicate_object then null;
end $$;

create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  correo text not null unique,
  nombres text not null,
  apellidos text not null,
  telefono text,
  rol public.rol_usuario not null default 'docente',
  estado public.estado_general not null default 'activo',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.docentes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid unique references public.usuarios(id) on delete set null,
  nombres text not null,
  apellidos text not null,
  correo text not null unique,
  telefono text,
  fotografia_url text,
  qr_pago_url text,
  estado public.estado_general not null default 'activo',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.estudiantes (
  id uuid primary key default gen_random_uuid(),
  nombres text not null,
  apellidos text not null,
  correo text,
  telefono text,
  documento text,
  estado public.estado_general not null default 'activo',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.cursos (
  id uuid primary key default gen_random_uuid(),
  docente_id uuid references public.docentes(id) on delete set null,
  nombre text not null,
  descripcion text,
  duracion text not null,
  precio numeric(12,2) not null check (precio >= 0),
  estado public.estado_general not null default 'activo',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.tandas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha_inicio date not null,
  fecha_fin date not null,
  estado public.estado_tanda not null default 'planificada',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint tandas_fechas_validas check (fecha_fin >= fecha_inicio)
);

create table if not exists public.tanda_cursos (
  id uuid primary key default gen_random_uuid(),
  tanda_id uuid not null references public.tandas(id) on delete cascade,
  curso_id uuid not null references public.cursos(id) on delete cascade,
  creado_en timestamptz not null default now(),
  unique (tanda_id, curso_id)
);

create table if not exists public.inscripciones (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references public.estudiantes(id) on delete restrict,
  curso_id uuid not null references public.cursos(id) on delete restrict,
  tanda_id uuid not null references public.tandas(id) on delete restrict,
  monto_pagado numeric(12,2) not null check (monto_pagado >= 0),
  comprobante_pago_url text,
  registrado_por uuid references public.usuarios(id) on delete set null default auth.uid(),
  fecha timestamptz not null default now(),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.configuracion (
  id uuid primary key default gen_random_uuid(),
  porcentaje_docente numeric(5,2) not null default 60 check (porcentaje_docente >= 0 and porcentaje_docente <= 100),
  porcentaje_instituto numeric(5,2) not null default 40 check (porcentaje_instituto >= 0 and porcentaje_instituto <= 100),
  actualizado_por uuid references public.usuarios(id) on delete set null default auth.uid(),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint configuracion_porcentajes_100 check (porcentaje_docente + porcentaje_instituto = 100)
);

create table if not exists public.liquidaciones (
  id uuid primary key default gen_random_uuid(),
  inscripcion_id uuid not null unique references public.inscripciones(id) on delete cascade,
  docente_id uuid not null references public.docentes(id) on delete restrict,
  porcentaje_docente numeric(5,2) not null,
  porcentaje_instituto numeric(5,2) not null,
  monto_docente numeric(12,2) not null,
  monto_instituto numeric(12,2) not null,
  estado public.estado_liquidacion not null default 'pendiente',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.pagos_docentes (
  id uuid primary key default gen_random_uuid(),
  liquidacion_id uuid not null references public.liquidaciones(id) on delete restrict,
  docente_id uuid not null references public.docentes(id) on delete restrict,
  administrador_id uuid references public.usuarios(id) on delete set null default auth.uid(),
  monto numeric(12,2) not null check (monto >= 0),
  fecha timestamptz not null default now(),
  estado public.estado_pago not null default 'registrado',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.auditoria (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id) on delete set null default auth.uid(),
  accion text not null,
  tabla_afectada text not null,
  registro_afectado text,
  informacion_anterior jsonb,
  informacion_nueva jsonb,
  creado_en timestamptz not null default now()
);

create table if not exists public.temarios_docentes (
  id uuid primary key default gen_random_uuid(),
  docente_id uuid not null references public.docentes(id) on delete cascade,
  materia text not null,
  orden integer not null default 1,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  titulo text not null,
  mensaje text not null,
  leida boolean not null default false,
  creado_en timestamptz not null default now()
);

create table if not exists public.archivos (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  ruta text not null,
  tipo text not null,
  propietario_id uuid references public.usuarios(id) on delete set null,
  creado_por uuid references public.usuarios(id) on delete set null default auth.uid(),
  creado_en timestamptz not null default now(),
  unique (bucket, ruta)
);

create index if not exists idx_usuarios_rol on public.usuarios(rol);
create index if not exists idx_docentes_usuario_id on public.docentes(usuario_id);
create index if not exists idx_cursos_docente_id on public.cursos(docente_id);
create index if not exists idx_tanda_cursos_tanda_id on public.tanda_cursos(tanda_id);
create index if not exists idx_tanda_cursos_curso_id on public.tanda_cursos(curso_id);
create index if not exists idx_inscripciones_estudiante_id on public.inscripciones(estudiante_id);
create index if not exists idx_inscripciones_curso_id on public.inscripciones(curso_id);
create index if not exists idx_inscripciones_tanda_id on public.inscripciones(tanda_id);
create index if not exists idx_liquidaciones_docente_id on public.liquidaciones(docente_id);
create index if not exists idx_liquidaciones_estado on public.liquidaciones(estado);
create index if not exists idx_pagos_docentes_docente_id on public.pagos_docentes(docente_id);
create index if not exists idx_auditoria_tabla on public.auditoria(tabla_afectada);
create index if not exists idx_auditoria_creado_en on public.auditoria(creado_en desc);

create or replace function public.establecer_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create or replace function public.obtener_rol_actual()
returns public.rol_usuario
language sql
security definer
set search_path = public
stable
as $$
  select rol from public.usuarios where id = auth.uid() and estado = 'activo'
$$;

create or replace function public.es_superadmin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.obtener_rol_actual() = 'superadmin'
$$;

create or replace function public.es_administracion()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.obtener_rol_actual() in ('superadmin', 'administrador')
$$;

create or replace function public.es_docente_dueno(docente uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.docentes d
    where d.id = docente
      and d.usuario_id = auth.uid()
      and d.estado = 'activo'
  )
$$;

create or replace function public.proteger_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if (old.rol = 'superadmin' or new.rol = 'superadmin')
     and not public.es_superadmin() then
    raise exception 'Solo SUPERADMIN puede gestionar cuentas SUPERADMIN.';
  end if;

  if (old.rol is distinct from new.rol or old.estado is distinct from new.estado)
     and not public.es_administracion() then
    raise exception 'Solo ADMIN o SUPERADMIN puede modificar rol o estado.';
  end if;

  return new;
end;
$$;

create or replace function public.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  registro text;
begin
  registro := coalesce((to_jsonb(new)->>'id'), (to_jsonb(old)->>'id'));

  insert into public.auditoria (
    usuario_id,
    accion,
    tabla_afectada,
    registro_afectado,
    informacion_anterior,
    informacion_nueva
  )
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    registro,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  return coalesce(new, old);
end;
$$;

create or replace function public.generar_liquidacion_por_inscripcion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  docente uuid;
  porcentaje_docente_actual numeric(5,2);
  porcentaje_instituto_actual numeric(5,2);
begin
  select c.docente_id into docente
  from public.cursos c
  where c.id = new.curso_id;

  if docente is null then
    return new;
  end if;

  select porcentaje_docente, porcentaje_instituto
    into porcentaje_docente_actual, porcentaje_instituto_actual
  from public.configuracion
  order by creado_en asc
  limit 1;

  porcentaje_docente_actual := coalesce(porcentaje_docente_actual, 60);
  porcentaje_instituto_actual := coalesce(porcentaje_instituto_actual, 40);

  insert into public.liquidaciones (
    inscripcion_id,
    docente_id,
    porcentaje_docente,
    porcentaje_instituto,
    monto_docente,
    monto_instituto
  )
  values (
    new.id,
    docente,
    porcentaje_docente_actual,
    porcentaje_instituto_actual,
    round(new.monto_pagado * porcentaje_docente_actual / 100, 2),
    round(new.monto_pagado * porcentaje_instituto_actual / 100, 2)
  )
  on conflict (inscripcion_id) do nothing;

  return new;
end;
$$;

create or replace function public.marcar_liquidacion_pagada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.liquidaciones
  set estado = 'pagada',
      actualizado_en = now()
  where id = new.liquidacion_id
    and estado = 'pendiente';

  return new;
end;
$$;

do $$
declare
  tabla text;
begin
  foreach tabla in array array[
    'usuarios',
    'docentes',
    'estudiantes',
    'cursos',
    'tandas',
    'inscripciones',
    'configuracion',
    'liquidaciones',
    'pagos_docentes',
    'temarios_docentes'
  ]
  loop
    execute format('drop trigger if exists establecer_actualizado_en_%I on public.%I', tabla, tabla);
    execute format(
      'create trigger establecer_actualizado_en_%I before update on public.%I for each row execute function public.establecer_actualizado_en()',
      tabla,
      tabla
    );
  end loop;
end $$;

drop trigger if exists proteger_usuario_trigger on public.usuarios;
create trigger proteger_usuario_trigger
before update on public.usuarios
for each row execute function public.proteger_usuario();

drop trigger if exists generar_liquidacion_por_inscripcion_trigger on public.inscripciones;
create trigger generar_liquidacion_por_inscripcion_trigger
after insert on public.inscripciones
for each row execute function public.generar_liquidacion_por_inscripcion();

drop trigger if exists marcar_liquidacion_pagada_trigger on public.pagos_docentes;
create trigger marcar_liquidacion_pagada_trigger
after insert on public.pagos_docentes
for each row execute function public.marcar_liquidacion_pagada();

do $$
declare
  tabla text;
begin
  foreach tabla in array array[
    'usuarios',
    'docentes',
    'estudiantes',
    'cursos',
    'tandas',
    'tanda_cursos',
    'inscripciones',
    'configuracion',
    'liquidaciones',
    'pagos_docentes',
    'temarios_docentes',
    'notificaciones',
    'archivos'
  ]
  loop
    execute format('drop trigger if exists registrar_auditoria_%I on public.%I', tabla, tabla);
    execute format(
      'create trigger registrar_auditoria_%I after insert or update or delete on public.%I for each row execute function public.registrar_auditoria()',
      tabla,
      tabla
    );
  end loop;
end $$;

insert into public.configuracion (porcentaje_docente, porcentaje_instituto)
select 60, 40
where not exists (select 1 from public.configuracion);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('archivos_docentes', 'archivos_docentes', false, 3145728, array['image/png', 'image/jpeg', 'image/webp']),
  ('comprobantes_pago', 'comprobantes_pago', false, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

alter table public.usuarios enable row level security;
alter table public.docentes enable row level security;
alter table public.estudiantes enable row level security;
alter table public.cursos enable row level security;
alter table public.tandas enable row level security;
alter table public.tanda_cursos enable row level security;
alter table public.inscripciones enable row level security;
alter table public.configuracion enable row level security;
alter table public.liquidaciones enable row level security;
alter table public.pagos_docentes enable row level security;
alter table public.auditoria enable row level security;
alter table public.temarios_docentes enable row level security;
alter table public.notificaciones enable row level security;
alter table public.archivos enable row level security;

drop policy if exists usuarios_select on public.usuarios;
create policy usuarios_select on public.usuarios
for select to authenticated
using (id = (select auth.uid()) or public.es_administracion());

drop policy if exists usuarios_insert_superadmin on public.usuarios;
drop policy if exists usuarios_insert_admin on public.usuarios;
create policy usuarios_insert_admin on public.usuarios
for insert to authenticated
with check (public.es_administracion() and (rol <> 'superadmin' or public.es_superadmin()));

drop policy if exists usuarios_update_controlado on public.usuarios;
create policy usuarios_update_controlado on public.usuarios
for update to authenticated
using (id = (select auth.uid()) or public.es_administracion())
with check (id = (select auth.uid()) or public.es_administracion());

drop policy if exists docentes_select on public.docentes;
create policy docentes_select on public.docentes
for select to authenticated
using (public.es_administracion() or usuario_id = (select auth.uid()));

drop policy if exists docentes_insert_admin on public.docentes;
create policy docentes_insert_admin on public.docentes
for insert to authenticated
with check (public.es_administracion());

drop policy if exists docentes_update_admin_o_dueno on public.docentes;
create policy docentes_update_admin_o_dueno on public.docentes
for update to authenticated
using (public.es_administracion() or usuario_id = (select auth.uid()))
with check (public.es_administracion() or usuario_id = (select auth.uid()));

drop policy if exists docentes_delete_superadmin on public.docentes;
create policy docentes_delete_superadmin on public.docentes
for delete to authenticated
using (public.es_superadmin());

drop policy if exists estudiantes_select on public.estudiantes;
create policy estudiantes_select on public.estudiantes
for select to authenticated
using (
  public.es_administracion()
  or exists (
    select 1
    from public.inscripciones i
    join public.cursos c on c.id = i.curso_id
    join public.docentes d on d.id = c.docente_id
    where i.estudiante_id = estudiantes.id
      and d.usuario_id = (select auth.uid())
  )
);

drop policy if exists estudiantes_admin_total on public.estudiantes;
create policy estudiantes_admin_total on public.estudiantes
for all to authenticated
using (public.es_administracion())
with check (public.es_administracion());

drop policy if exists cursos_select on public.cursos;
create policy cursos_select on public.cursos
for select to authenticated
using (public.es_administracion() or public.es_docente_dueno(docente_id));

drop policy if exists cursos_admin_total on public.cursos;
create policy cursos_admin_total on public.cursos
for all to authenticated
using (public.es_administracion())
with check (public.es_administracion());

drop policy if exists tandas_select on public.tandas;
create policy tandas_select on public.tandas
for select to authenticated
using (
  public.es_administracion()
  or exists (
    select 1
    from public.tanda_cursos tc
    join public.cursos c on c.id = tc.curso_id
    where tc.tanda_id = tandas.id
      and public.es_docente_dueno(c.docente_id)
  )
);

drop policy if exists tandas_admin_total on public.tandas;
create policy tandas_admin_total on public.tandas
for all to authenticated
using (public.es_administracion())
with check (public.es_administracion());

drop policy if exists tanda_cursos_select on public.tanda_cursos;
create policy tanda_cursos_select on public.tanda_cursos
for select to authenticated
using (
  public.es_administracion()
  or exists (
    select 1 from public.cursos c
    where c.id = tanda_cursos.curso_id
      and public.es_docente_dueno(c.docente_id)
  )
);

drop policy if exists tanda_cursos_admin_total on public.tanda_cursos;
create policy tanda_cursos_admin_total on public.tanda_cursos
for all to authenticated
using (public.es_administracion())
with check (public.es_administracion());

drop policy if exists inscripciones_select on public.inscripciones;
create policy inscripciones_select on public.inscripciones
for select to authenticated
using (
  public.es_administracion()
  or exists (
    select 1 from public.cursos c
    where c.id = inscripciones.curso_id
      and public.es_docente_dueno(c.docente_id)
  )
);

drop policy if exists inscripciones_admin_total on public.inscripciones;
create policy inscripciones_admin_total on public.inscripciones
for all to authenticated
using (public.es_administracion())
with check (public.es_administracion());

drop policy if exists configuracion_select on public.configuracion;
create policy configuracion_select on public.configuracion
for select to authenticated
using (true);

drop policy if exists configuracion_superadmin_total on public.configuracion;
create policy configuracion_superadmin_total on public.configuracion
for all to authenticated
using (public.es_superadmin())
with check (public.es_superadmin());

drop policy if exists liquidaciones_select on public.liquidaciones;
create policy liquidaciones_select on public.liquidaciones
for select to authenticated
using (public.es_administracion() or public.es_docente_dueno(docente_id));

drop policy if exists liquidaciones_admin_update on public.liquidaciones;
create policy liquidaciones_admin_update on public.liquidaciones
for update to authenticated
using (public.es_administracion())
with check (public.es_administracion());

drop policy if exists pagos_select on public.pagos_docentes;
create policy pagos_select on public.pagos_docentes
for select to authenticated
using (public.es_administracion() or public.es_docente_dueno(docente_id));

drop policy if exists pagos_admin_insert on public.pagos_docentes;
create policy pagos_admin_insert on public.pagos_docentes
for insert to authenticated
with check (public.es_administracion());

drop policy if exists pagos_admin_update on public.pagos_docentes;
create policy pagos_admin_update on public.pagos_docentes
for update to authenticated
using (public.es_administracion())
with check (public.es_administracion());

drop policy if exists auditoria_superadmin_select on public.auditoria;
create policy auditoria_superadmin_select on public.auditoria
for select to authenticated
using (public.es_superadmin());

drop policy if exists temarios_select on public.temarios_docentes;
create policy temarios_select on public.temarios_docentes
for select to authenticated
using (public.es_administracion() or public.es_docente_dueno(docente_id));

drop policy if exists temarios_docente_total on public.temarios_docentes;
create policy temarios_docente_total on public.temarios_docentes
for all to authenticated
using (public.es_docente_dueno(docente_id))
with check (public.es_docente_dueno(docente_id));

drop policy if exists notificaciones_select on public.notificaciones;
create policy notificaciones_select on public.notificaciones
for select to authenticated
using (usuario_id = (select auth.uid()) or public.es_administracion());

drop policy if exists notificaciones_update_propias on public.notificaciones;
create policy notificaciones_update_propias on public.notificaciones
for update to authenticated
using (usuario_id = (select auth.uid()) or public.es_administracion())
with check (usuario_id = (select auth.uid()) or public.es_administracion());

drop policy if exists notificaciones_admin_insert on public.notificaciones;
create policy notificaciones_admin_insert on public.notificaciones
for insert to authenticated
with check (public.es_administracion());

drop policy if exists archivos_select on public.archivos;
create policy archivos_select on public.archivos
for select to authenticated
using (propietario_id = (select auth.uid()) or creado_por = (select auth.uid()) or public.es_administracion());

drop policy if exists archivos_insert_auth on public.archivos;
create policy archivos_insert_auth on public.archivos
for insert to authenticated
with check (creado_por = (select auth.uid()) or public.es_administracion());

drop policy if exists storage_archivos_select on storage.objects;
create policy storage_archivos_select on storage.objects
for select to authenticated
using (bucket_id in ('archivos_docentes', 'comprobantes_pago'));

drop policy if exists storage_archivos_insert on storage.objects;
create policy storage_archivos_insert on storage.objects
for insert to authenticated
with check (bucket_id in ('archivos_docentes', 'comprobantes_pago'));

drop policy if exists storage_archivos_update on storage.objects;
create policy storage_archivos_update on storage.objects
for update to authenticated
using (bucket_id in ('archivos_docentes', 'comprobantes_pago') and owner = (select auth.uid()))
with check (bucket_id in ('archivos_docentes', 'comprobantes_pago') and owner = (select auth.uid()));

drop policy if exists storage_archivos_delete on storage.objects;
create policy storage_archivos_delete on storage.objects
for delete to authenticated
using (bucket_id in ('archivos_docentes', 'comprobantes_pago') and (owner = (select auth.uid()) or public.es_administracion()));
