create or replace function public.rol_actual_texto_rls()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select lower(u.rol::text)
  from public.usuarios u
  where u.id = (select auth.uid())
    and lower(u.estado::text) = 'activo'
  limit 1
$$;

create or replace function public.es_superadmin_rls()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.rol_actual_texto_rls() = 'superadmin'
$$;

create or replace function public.es_administracion_rls()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.rol_actual_texto_rls() in ('superadmin', 'admin', 'administrador')
$$;

create or replace function public.es_docente_dueno_rls(docente_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.docentes d
    where d.id = $1
      and d.usuario_id = (select auth.uid())
  )
$$;

alter table public.auditoria enable row level security;
alter table public.configuracion enable row level security;
alter table public.cursos enable row level security;
alter table public.docentes enable row level security;
alter table public.estudiantes enable row level security;
alter table public.inscripciones enable row level security;
alter table public.liquidaciones enable row level security;
alter table public.notificaciones enable row level security;
alter table public.pagos_docentes enable row level security;
alter table public.tanda_cursos enable row level security;
alter table public.tandas enable row level security;
alter table public.temarios_docentes enable row level security;
alter table public.usuarios enable row level security;

drop policy if exists auditoria_superadmin_select on public.auditoria;
drop policy if exists auditoria_authenticated_select on public.auditoria;
drop policy if exists auditoria_authenticated_insert on public.auditoria;
drop policy if exists auditoria_authenticated_update on public.auditoria;
drop policy if exists auditoria_authenticated_delete on public.auditoria;

create policy auditoria_authenticated_select on public.auditoria
for select to authenticated
using (public.es_administracion_rls());

create policy auditoria_authenticated_insert on public.auditoria
for insert to authenticated
with check (public.es_administracion_rls());

create policy auditoria_authenticated_update on public.auditoria
for update to authenticated
using (public.es_administracion_rls())
with check (public.es_administracion_rls());

create policy auditoria_authenticated_delete on public.auditoria
for delete to authenticated
using (public.es_administracion_rls());

drop policy if exists configuracion_select on public.configuracion;
drop policy if exists configuracion_superadmin_total on public.configuracion;
drop policy if exists configuracion_authenticated_select on public.configuracion;
drop policy if exists configuracion_authenticated_insert on public.configuracion;
drop policy if exists configuracion_authenticated_update on public.configuracion;
drop policy if exists configuracion_authenticated_delete on public.configuracion;

create policy configuracion_authenticated_select on public.configuracion
for select to authenticated
using (public.es_administracion_rls());

create policy configuracion_authenticated_insert on public.configuracion
for insert to authenticated
with check (public.es_administracion_rls());

create policy configuracion_authenticated_update on public.configuracion
for update to authenticated
using (public.es_administracion_rls())
with check (public.es_administracion_rls());

create policy configuracion_authenticated_delete on public.configuracion
for delete to authenticated
using (public.es_administracion_rls());

drop policy if exists cursos_select on public.cursos;
drop policy if exists cursos_admin_total on public.cursos;
drop policy if exists cursos_authenticated_select on public.cursos;
drop policy if exists cursos_authenticated_insert on public.cursos;
drop policy if exists cursos_authenticated_update on public.cursos;
drop policy if exists cursos_authenticated_delete on public.cursos;

create policy cursos_authenticated_select on public.cursos
for select to authenticated
using (true);

create policy cursos_authenticated_insert on public.cursos
for insert to authenticated
with check (public.es_administracion_rls());

create policy cursos_authenticated_update on public.cursos
for update to authenticated
using (public.es_administracion_rls())
with check (public.es_administracion_rls());

create policy cursos_authenticated_delete on public.cursos
for delete to authenticated
using (public.es_administracion_rls());

drop policy if exists docentes_select on public.docentes;
drop policy if exists docentes_insert_admin on public.docentes;
drop policy if exists docentes_update_admin_o_dueno on public.docentes;
drop policy if exists docentes_delete_superadmin on public.docentes;
drop policy if exists docentes_authenticated_select on public.docentes;
drop policy if exists docentes_authenticated_insert on public.docentes;
drop policy if exists docentes_authenticated_update on public.docentes;
drop policy if exists docentes_authenticated_delete on public.docentes;

create policy docentes_authenticated_select on public.docentes
for select to authenticated
using (public.es_administracion_rls() or usuario_id = (select auth.uid()));

create policy docentes_authenticated_insert on public.docentes
for insert to authenticated
with check (public.es_administracion_rls() or usuario_id = (select auth.uid()));

create policy docentes_authenticated_update on public.docentes
for update to authenticated
using (public.es_administracion_rls() or usuario_id = (select auth.uid()))
with check (public.es_administracion_rls() or usuario_id = (select auth.uid()));

create policy docentes_authenticated_delete on public.docentes
for delete to authenticated
using (public.es_administracion_rls());

drop policy if exists estudiantes_select on public.estudiantes;
drop policy if exists estudiantes_admin_total on public.estudiantes;
drop policy if exists estudiantes_authenticated_select on public.estudiantes;
drop policy if exists estudiantes_authenticated_insert on public.estudiantes;
drop policy if exists estudiantes_authenticated_update on public.estudiantes;
drop policy if exists estudiantes_authenticated_delete on public.estudiantes;

create policy estudiantes_authenticated_select on public.estudiantes
for select to authenticated
using (true);

create policy estudiantes_authenticated_insert on public.estudiantes
for insert to authenticated
with check (public.es_administracion_rls());

create policy estudiantes_authenticated_update on public.estudiantes
for update to authenticated
using (public.es_administracion_rls())
with check (public.es_administracion_rls());

create policy estudiantes_authenticated_delete on public.estudiantes
for delete to authenticated
using (public.es_administracion_rls());

drop policy if exists inscripciones_select on public.inscripciones;
drop policy if exists inscripciones_admin_total on public.inscripciones;
drop policy if exists inscripciones_authenticated_select on public.inscripciones;
drop policy if exists inscripciones_authenticated_insert on public.inscripciones;
drop policy if exists inscripciones_authenticated_update on public.inscripciones;
drop policy if exists inscripciones_authenticated_delete on public.inscripciones;

create policy inscripciones_authenticated_select on public.inscripciones
for select to authenticated
using (true);

create policy inscripciones_authenticated_insert on public.inscripciones
for insert to authenticated
with check (public.es_administracion_rls());

create policy inscripciones_authenticated_update on public.inscripciones
for update to authenticated
using (public.es_administracion_rls())
with check (public.es_administracion_rls());

create policy inscripciones_authenticated_delete on public.inscripciones
for delete to authenticated
using (public.es_administracion_rls());

drop policy if exists liquidaciones_select on public.liquidaciones;
drop policy if exists liquidaciones_admin_update on public.liquidaciones;
drop policy if exists liquidaciones_authenticated_select on public.liquidaciones;
drop policy if exists liquidaciones_authenticated_insert on public.liquidaciones;
drop policy if exists liquidaciones_authenticated_update on public.liquidaciones;
drop policy if exists liquidaciones_authenticated_delete on public.liquidaciones;

create policy liquidaciones_authenticated_select on public.liquidaciones
for select to authenticated
using (public.es_administracion_rls() or public.es_docente_dueno_rls(docente_id));

create policy liquidaciones_authenticated_insert on public.liquidaciones
for insert to authenticated
with check (public.es_administracion_rls() or public.es_docente_dueno_rls(docente_id));

create policy liquidaciones_authenticated_update on public.liquidaciones
for update to authenticated
using (public.es_administracion_rls() or public.es_docente_dueno_rls(docente_id))
with check (public.es_administracion_rls() or public.es_docente_dueno_rls(docente_id));

create policy liquidaciones_authenticated_delete on public.liquidaciones
for delete to authenticated
using (public.es_administracion_rls() or public.es_docente_dueno_rls(docente_id));

drop policy if exists notificaciones_select on public.notificaciones;
drop policy if exists notificaciones_update_propias on public.notificaciones;
drop policy if exists notificaciones_admin_insert on public.notificaciones;
drop policy if exists notificaciones_authenticated_select on public.notificaciones;
drop policy if exists notificaciones_authenticated_insert on public.notificaciones;
drop policy if exists notificaciones_authenticated_update on public.notificaciones;
drop policy if exists notificaciones_authenticated_delete on public.notificaciones;

create policy notificaciones_authenticated_select on public.notificaciones
for select to authenticated
using (usuario_id = (select auth.uid()) or public.es_administracion_rls());

create policy notificaciones_authenticated_insert on public.notificaciones
for insert to authenticated
with check (usuario_id = (select auth.uid()) or public.es_administracion_rls());

create policy notificaciones_authenticated_update on public.notificaciones
for update to authenticated
using (usuario_id = (select auth.uid()) or public.es_administracion_rls())
with check (usuario_id = (select auth.uid()) or public.es_administracion_rls());

create policy notificaciones_authenticated_delete on public.notificaciones
for delete to authenticated
using (usuario_id = (select auth.uid()) or public.es_administracion_rls());

drop policy if exists pagos_select on public.pagos_docentes;
drop policy if exists pagos_admin_insert on public.pagos_docentes;
drop policy if exists pagos_admin_update on public.pagos_docentes;
drop policy if exists pagos_authenticated_select on public.pagos_docentes;
drop policy if exists pagos_authenticated_insert on public.pagos_docentes;
drop policy if exists pagos_authenticated_update on public.pagos_docentes;
drop policy if exists pagos_authenticated_delete on public.pagos_docentes;

create policy pagos_authenticated_select on public.pagos_docentes
for select to authenticated
using (
  public.es_administracion_rls()
  or exists (
    select 1
    from public.liquidaciones l
    where l.id = pagos_docentes.liquidacion_id
      and public.es_docente_dueno_rls(l.docente_id)
  )
);

create policy pagos_authenticated_insert on public.pagos_docentes
for insert to authenticated
with check (
  public.es_administracion_rls()
  or exists (
    select 1
    from public.liquidaciones l
    where l.id = pagos_docentes.liquidacion_id
      and public.es_docente_dueno_rls(l.docente_id)
  )
);

create policy pagos_authenticated_update on public.pagos_docentes
for update to authenticated
using (
  public.es_administracion_rls()
  or exists (
    select 1
    from public.liquidaciones l
    where l.id = pagos_docentes.liquidacion_id
      and public.es_docente_dueno_rls(l.docente_id)
  )
)
with check (
  public.es_administracion_rls()
  or exists (
    select 1
    from public.liquidaciones l
    where l.id = pagos_docentes.liquidacion_id
      and public.es_docente_dueno_rls(l.docente_id)
  )
);

create policy pagos_authenticated_delete on public.pagos_docentes
for delete to authenticated
using (
  public.es_administracion_rls()
  or exists (
    select 1
    from public.liquidaciones l
    where l.id = pagos_docentes.liquidacion_id
      and public.es_docente_dueno_rls(l.docente_id)
  )
);

drop policy if exists tanda_cursos_select on public.tanda_cursos;
drop policy if exists tanda_cursos_admin_total on public.tanda_cursos;
drop policy if exists tanda_cursos_authenticated_select on public.tanda_cursos;
drop policy if exists tanda_cursos_authenticated_insert on public.tanda_cursos;
drop policy if exists tanda_cursos_authenticated_update on public.tanda_cursos;
drop policy if exists tanda_cursos_authenticated_delete on public.tanda_cursos;

create policy tanda_cursos_authenticated_select on public.tanda_cursos
for select to authenticated
using (true);

create policy tanda_cursos_authenticated_insert on public.tanda_cursos
for insert to authenticated
with check (public.es_administracion_rls());

create policy tanda_cursos_authenticated_update on public.tanda_cursos
for update to authenticated
using (public.es_administracion_rls())
with check (public.es_administracion_rls());

create policy tanda_cursos_authenticated_delete on public.tanda_cursos
for delete to authenticated
using (public.es_administracion_rls());

drop policy if exists tandas_select on public.tandas;
drop policy if exists tandas_admin_total on public.tandas;
drop policy if exists tandas_authenticated_select on public.tandas;
drop policy if exists tandas_authenticated_insert on public.tandas;
drop policy if exists tandas_authenticated_update on public.tandas;
drop policy if exists tandas_authenticated_delete on public.tandas;

create policy tandas_authenticated_select on public.tandas
for select to authenticated
using (true);

create policy tandas_authenticated_insert on public.tandas
for insert to authenticated
with check (public.es_administracion_rls());

create policy tandas_authenticated_update on public.tandas
for update to authenticated
using (public.es_administracion_rls())
with check (public.es_administracion_rls());

create policy tandas_authenticated_delete on public.tandas
for delete to authenticated
using (public.es_administracion_rls());

drop policy if exists temarios_select on public.temarios_docentes;
drop policy if exists temarios_docente_total on public.temarios_docentes;
drop policy if exists temarios_authenticated_select on public.temarios_docentes;
drop policy if exists temarios_authenticated_insert on public.temarios_docentes;
drop policy if exists temarios_authenticated_update on public.temarios_docentes;
drop policy if exists temarios_authenticated_delete on public.temarios_docentes;

create policy temarios_authenticated_select on public.temarios_docentes
for select to authenticated
using (public.es_administracion_rls() or public.es_docente_dueno_rls(docente_id));

create policy temarios_authenticated_insert on public.temarios_docentes
for insert to authenticated
with check (public.es_administracion_rls() or public.es_docente_dueno_rls(docente_id));

create policy temarios_authenticated_update on public.temarios_docentes
for update to authenticated
using (public.es_administracion_rls() or public.es_docente_dueno_rls(docente_id))
with check (public.es_administracion_rls() or public.es_docente_dueno_rls(docente_id));

create policy temarios_authenticated_delete on public.temarios_docentes
for delete to authenticated
using (public.es_administracion_rls() or public.es_docente_dueno_rls(docente_id));

drop policy if exists usuarios_select on public.usuarios;
drop policy if exists usuarios_insert_superadmin on public.usuarios;
drop policy if exists usuarios_insert_admin on public.usuarios;
drop policy if exists usuarios_update_controlado on public.usuarios;
drop policy if exists usuarios_authenticated_select on public.usuarios;
drop policy if exists usuarios_authenticated_insert on public.usuarios;
drop policy if exists usuarios_authenticated_update on public.usuarios;
drop policy if exists usuarios_authenticated_delete on public.usuarios;

create policy usuarios_authenticated_select on public.usuarios
for select to authenticated
using (id = (select auth.uid()) or public.es_administracion_rls());

create policy usuarios_authenticated_insert on public.usuarios
for insert to authenticated
with check (
  public.es_administracion_rls()
  and (lower(rol::text) <> 'superadmin' or public.es_superadmin_rls())
);

create policy usuarios_authenticated_update on public.usuarios
for update to authenticated
using (id = (select auth.uid()) or public.es_administracion_rls())
with check (
  (id = (select auth.uid()) or public.es_administracion_rls())
  and (lower(rol::text) <> 'superadmin' or public.es_superadmin_rls())
);

create policy usuarios_authenticated_delete on public.usuarios
for delete to authenticated
using (
  public.es_administracion_rls()
  and (lower(rol::text) <> 'superadmin' or public.es_superadmin_rls())
);

drop policy if exists storage_archivos_select on storage.objects;
drop policy if exists storage_archivos_insert on storage.objects;
drop policy if exists storage_archivos_update on storage.objects;
drop policy if exists storage_archivos_delete on storage.objects;
drop policy if exists storage_archivos_authenticated_select on storage.objects;
drop policy if exists storage_archivos_authenticated_insert on storage.objects;
drop policy if exists storage_archivos_authenticated_update on storage.objects;
drop policy if exists storage_archivos_authenticated_delete on storage.objects;

create policy storage_archivos_authenticated_select on storage.objects
for select to authenticated
using (bucket_id in ('archivos_docentes', 'comprobantes_pago'));

create policy storage_archivos_authenticated_insert on storage.objects
for insert to authenticated
with check (bucket_id in ('archivos_docentes', 'comprobantes_pago'));

create policy storage_archivos_authenticated_update on storage.objects
for update to authenticated
using (
  bucket_id in ('archivos_docentes', 'comprobantes_pago')
  and (owner = (select auth.uid()) or public.es_administracion_rls())
)
with check (
  bucket_id in ('archivos_docentes', 'comprobantes_pago')
  and (owner = (select auth.uid()) or public.es_administracion_rls())
);

create policy storage_archivos_authenticated_delete on storage.objects
for delete to authenticated
using (
  bucket_id in ('archivos_docentes', 'comprobantes_pago')
  and (owner = (select auth.uid()) or public.es_administracion_rls())
);
