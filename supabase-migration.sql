-- ============================================
-- MIGRACIÓN COMPLETA SUPABASE - Psicología & Bienestar
-- ============================================
-- Ejecutar en: Supabase Dashboard → SQL Editor

-- 1. CREAR TABLAS
-- ============================================

-- Tabla: noticias
create table if not exists noticias (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  slug text unique not null,
  contenido text,
  imagen text,
  resumen text,
  categoria text default 'General',
  fecha_publicacion timestamptz default now(),
  autor text,
  estado text default 'borrador' check (estado in ('borrador', 'publicado', 'archivado')),
  destacado boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabla: eventos
create table if not exists eventos (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  descripcion text,
  imagen text,
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  ubicacion text,
  modalidad text default 'Presencial' check (modalidad in ('Presencial', 'Virtual', 'Híbrido')),
  enlace text,
  cupos integer,
  estado text default 'publicado' check (estado in ('publicado', 'cancelado', 'finalizado')),
  created_at timestamptz default now()
);

-- Tabla: galeria
create table if not exists galeria (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  titulo text,
  descripcion text,
  categoria text default 'General',
  created_at timestamptz default now()
);

-- Tabla: testimonios
create table if not exists testimonios (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  comentario text not null,
  foto text,
  calificacion integer default 5 check (calificacion >= 1 and calificacion <= 5),
  estado text default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  created_at timestamptz default now()
);

-- Tabla: comentarios
create table if not exists comentarios (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  comentario text not null,
  avatar text,
  estado text default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  noticia_id uuid references noticias(id) on delete cascade,
  created_at timestamptz default now()
);

-- 2. CREAR ÍNDICES
-- ============================================
create index if not exists idx_noticias_estado on noticias(estado);
create index if not exists idx_noticias_fecha on noticias(fecha_publicacion desc);
create index if not exists idx_eventos_fecha on eventos(fecha_inicio);
create index if not exists idx_galeria_fecha on galeria(created_at desc);
create index if not exists idx_testimonios_estado on testimonios(estado);
create index if not exists idx_comentarios_estado on comentarios(estado);
create index if not exists idx_comentarios_noticia on comentarios(noticia_id);

-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================
alter table noticias enable row level security;
alter table eventos enable row level security;
alter table galeria enable row level security;
alter table testimonios enable row level security;
alter table comentarios enable row level security;

-- 4. RLS POLICIES
-- ============================================

-- Políticas públicas (lectura)
create policy "Noticias públicas lectura" on noticias
  for select using (estado = 'publicado');

create policy "Eventos públicos lectura" on eventos
  for select using (estado = 'publicado');

create policy "Galería pública lectura" on galeria
  for select using (true);

create policy "Testimonios aprobados lectura" on testimonios
  for select using (estado = 'aprobado');

create policy "Comentarios aprobados lectura" on comentarios
  for select using (estado = 'aprobado');

-- Políticas de administración (rol admin/editor)
create policy "Admin full access noticias" on noticias
  for all using (auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Admin full access eventos" on eventos
  for all using (auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Admin full access galeria" on galeria
  for all using (auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Admin full access testimonios" on testimonios
  for all using (auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Admin full access comentarios" on comentarios
  for all using (auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor'));

-- 5. STORAGE BUCKETS
-- ============================================
insert into storage.buckets (id, name, public) values ('galeria', 'galeria', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('noticias', 'noticias', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('eventos', 'eventos', true) on conflict do nothing;

-- 6. STORAGE POLICIES
-- ============================================
create policy "Public read storage" on storage.objects
  for select using (true);

create policy "Admin upload galeria" on storage.objects
  for insert with check (
    bucket_id = 'galeria'
    and auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor')
  );

create policy "Admin delete galeria" on storage.objects
  for delete using (
    bucket_id = 'galeria'
    and auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor')
  );

create policy "Admin upload noticias" on storage.objects
  for insert with check (
    bucket_id = 'noticias'
    and auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor')
  );

create policy "Admin delete noticias" on storage.objects
  for delete using (
    bucket_id = 'noticias'
    and auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor')
  );

create policy "Admin upload eventos" on storage.objects
  for insert with check (
    bucket_id = 'eventos'
    and auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor')
  );

create policy "Admin delete eventos" on storage.objects
  for delete using (
    bucket_id = 'eventos'
    and auth.jwt() -> 'user_metadata' ->> 'role' in ('admin', 'editor')
  );

-- 7. TRIGGER PARA UPDATED_AT
-- ============================================
create extension if not exists moddatetime;

create trigger handle_updated_at before update on noticias
  for each row execute procedure moddatetime (updated_at);

-- 8. FUNCIÓN PARA GENERAR SLUG
-- ============================================
create or replace function generate_slug(title text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]', '', 'g'), '\s+', '-', 'g'))
$$;

-- ============================================
-- 9. CREAR USUARIO ADMIN
-- ============================================
-- No se puede insertar directamente en auth.users con SQL.
-- Usa el Dashboard de Supabase:
--
-- 1. Authentication → Users → "Add User"
-- 2. Email: admin@psicologiaybienestar.com
--    Password: (elige una segura, ej: Admin2025!)
-- 3. Luego ejecuta esto en SQL Editor:
--
--    UPDATE auth.users
--    SET raw_user_meta_data = '{"role": "admin"}'
--    WHERE email = 'admin@psicologiaybienestar.com';
