# digitalservices-admin

Sistema administrativo para DigitalServices desarrollado con Next.js, React, TypeScript, Supabase, Tailwind CSS y arquitectura por features.

## Requisitos

- Node.js 20 o superior.
- Proyecto Supabase con Auth, Database, Storage y RLS.

## Configuración

1. Copia `.env.example` a `.env.local` o `.env`.
2. Completa `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y `NEXT_PUBLIC_URL_APLICACION`.
3. Ejecuta la migración `supabase/migrations/001_esquema_inicial.sql` en Supabase.
4. Crea el primer usuario en Supabase Auth y registra su perfil activo en `public.usuarios`.
   Para el primer superadmin puedes ejecutar este SQL en Supabase, cambiando el correo:

```sql
insert into public.usuarios (id, correo, nombres, apellidos, rol, estado)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'nombres', 'Super'),
  coalesce(raw_user_meta_data->>'apellidos', 'Admin'),
  'superadmin',
  'activo'
from auth.users
where email = 'admin@digitalservices.bo'
on conflict (id) do update
set
  correo = excluded.correo,
  rol = excluded.rol,
  estado = excluded.estado;
```

5. Instala dependencias y ejecuta el entorno local:

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev`: inicia el entorno local.
- `npm run build`: compila para producción.
- `npm run lint`: valida reglas de lint.
- `npm run typecheck`: valida tipos TypeScript.

## Roles

- `superadmin`: acceso total, configuración financiera y auditoría.
- `administrador`: gestión operativa, liquidaciones, pagos y reportes.
- `docente`: perfil, temario, alumnos inscritos, ganancias e historial de pagos.
