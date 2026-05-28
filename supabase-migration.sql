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
  for select using (estado in ('publicado', 'finalizado', 'cancelado', 'pospuesto'));

create policy "Galería pública lectura" on galeria
  for select using (true);

create policy "Testimonios aprobados lectura" on testimonios
  for select using (estado = 'aprobado');

create policy "Comentarios aprobados lectura" on comentarios
  for select using (estado = 'aprobado');

-- Políticas de administración (rol admin/editor)
create policy "Admin full access noticias" on noticias
  for all using (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Admin full access eventos" on eventos
  for all using (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Admin full access galeria" on galeria
  for all using (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Admin full access testimonios" on testimonios
  for all using (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Admin full access comentarios" on comentarios
  for all using (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'));

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
    and auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor')
  );

create policy "Admin delete galeria" on storage.objects
  for delete using (
    bucket_id = 'galeria'
    and auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor')
  );

create policy "Admin upload noticias" on storage.objects
  for insert with check (
    bucket_id = 'noticias'
    and auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor')
  );

create policy "Admin delete noticias" on storage.objects
  for delete using (
    bucket_id = 'noticias'
    and auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor')
  );

create policy "Admin upload eventos" on storage.objects
  for insert with check (
    bucket_id = 'eventos'
    and auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor')
  );

create policy "Admin delete eventos" on storage.objects
  for delete using (
    bucket_id = 'eventos'
    and auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor')
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
--    SET raw_app_meta_data = '{"role": "admin"}'
--    WHERE email = 'admin@psicologiaybienestar.com';
--
-- NOTA: raw_app_meta_data se usa en lugar de raw_user_meta_data porque
-- app_metadata es controlado por el servidor (no editable por usuarios finales),
-- lo que evita el lint error "rls_references_user_metadata" de Supabase.

-- ============================================
-- 10. NUEVAS TABLAS ESCALABLES — MÓDULOS EXPANDIDOS
-- ============================================

-- Tabla: motivational_quotes
create table if not exists motivational_quotes (
  id uuid default gen_random_uuid() primary key,
  quote text not null,
  author text default 'Anónimo',
  category text default 'general',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Tabla: emotional_tips
create table if not exists emotional_tips (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  emotion_type text default 'general',
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Tabla: mini_games
create table if not exists mini_games (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  game_type text default 'affirmations' check (game_type in ('breathing','affirmations','gratitude','trivia','memory','other')),
  difficulty text default 'facil' check (difficulty in ('facil','medio','dificil')),
  icon text default '🎮',
  route text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Tabla: emotions
create table if not exists emotions (
  id uuid default gen_random_uuid() primary key,
  emotion_name text not null,
  description text,
  color text default '#F9FAFB',
  icon text default '😊',
  recommendations jsonb default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Tabla: wellness_activities
create table if not exists wellness_activities (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  activity_type text default 'mindfulness' check (activity_type in ('mindfulness','meditation','breathing','relaxation','exercise','other')),
  duration integer, -- minutes
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Tabla: appointments (solicitudes de citas)
create table if not exists appointments (
  id uuid default gen_random_uuid() primary key,
  user_name text not null,
  email text not null,
  phone text,
  requested_date date,
  requested_time time,
  message text,
  status text default 'pendiente' check (status in ('pendiente','confirmada','cancelada','completada')),
  created_at timestamptz default now()
);

-- Tabla: user_progress (progreso emocional anónimo)
create table if not exists user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid, -- nullable para usuarios anónimos
  completed_activity text,
  emotional_state text,
  score integer,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Ampliar CHECK de eventos para incluir nuevos estados
alter table eventos drop constraint if exists eventos_estado_check;
alter table eventos add constraint eventos_estado_check
  check (estado in ('publicado','cancelado','finalizado','pospuesto','borrador'));

-- ============================================
-- 11. ÍNDICES PARA NUEVAS TABLAS
-- ============================================
create index if not exists idx_quotes_category on motivational_quotes(category);
create index if not exists idx_quotes_active on motivational_quotes(is_active);
create index if not exists idx_tips_emotion on emotional_tips(emotion_type);
create index if not exists idx_tips_active on emotional_tips(is_active);
create index if not exists idx_games_type on mini_games(game_type);
create index if not exists idx_games_active on mini_games(is_active);
create index if not exists idx_emotions_name on emotions(emotion_name);
create index if not exists idx_activities_type on wellness_activities(activity_type);
create index if not exists idx_activities_active on wellness_activities(is_active);
create index if not exists idx_appointments_status on appointments(status);
create index if not exists idx_appointments_date on appointments(requested_date);
create index if not exists idx_progress_user on user_progress(user_id);
create index if not exists idx_progress_state on user_progress(emotional_state);

-- ============================================
-- 12. RLS — NUEVAS TABLAS
-- ============================================
alter table motivational_quotes enable row level security;
alter table emotional_tips enable row level security;
alter table mini_games enable row level security;
alter table emotions enable row level security;
alter table wellness_activities enable row level security;
alter table appointments enable row level security;
alter table user_progress enable row level security;

-- Políticas públicas (solo activos)
create policy "Quotes públicos activos" on motivational_quotes
  for select using (is_active = true);

create policy "Tips públicos activos" on emotional_tips
  for select using (is_active = true);

create policy "Games públicos activos" on mini_games
  for select using (is_active = true);

create policy "Emotions públicos activos" on emotions
  for select using (is_active = true);

create policy "Activities públicos activos" on wellness_activities
  for select using (is_active = true);

-- Appointments: solo el propio usuario puede ver sus citas (por email)
create policy "Appointments propio usuario" on appointments
  for select using (email = auth.jwt() ->> 'email');

-- User progress: solo propio usuario
create policy "Progress propio usuario" on user_progress
  for select using (user_id = auth.uid());
create policy "Progress insert propio" on user_progress
  for insert with check (user_id = auth.uid());

-- Políticas de administración (rol admin/editor) — todas las tablas nuevas
create policy "Admin full access quotes" on motivational_quotes
  for all using (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Admin full access tips" on emotional_tips
  for all using (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Admin full access games" on mini_games
  for all using (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Admin full access emotions" on emotions
  for all using (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Admin full access activities" on wellness_activities
  for all using (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Admin full access appointments" on appointments
  for all using (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Admin full access progress" on user_progress
  for all using (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'))
  with check (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'));

-- ============================================
-- 13. STORAGE BUCKET ADICIONAL
-- ============================================
insert into storage.buckets (id, name, public) values ('wellness', 'wellness', true) on conflict do nothing;

-- Políticas para bucket wellness
create policy "Public read wellness storage" on storage.objects
  for select using (bucket_id = 'wellness');

create policy "Admin upload wellness" on storage.objects
  for insert with check (
    bucket_id = 'wellness'
    and auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor')
  );

create policy "Admin delete wellness" on storage.objects
  for delete using (
    bucket_id = 'wellness'
    and auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor')
  );

-- ============================================
-- 14. TRIGGERS PARA UPDATED_AT (nuevas tablas)
-- ============================================
create trigger handle_updated_at_quotes before update on motivational_quotes
  for each row execute procedure moddatetime (updated_at);

create trigger handle_updated_at_tips before update on emotional_tips
  for each row execute procedure moddatetime (updated_at);

-- Añadir columna updated_at a las tablas que lo necesiten (si no existe)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'motivational_quotes' and column_name = 'updated_at') then
    alter table motivational_quotes add column updated_at timestamptz default now();
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'emotional_tips' and column_name = 'updated_at') then
    alter table emotional_tips add column updated_at timestamptz default now();
  end if;
end;
$$;

-- ============================================
-- 15. VISTA ADMIN — ESTADÍSTICAS PARA DASHBOARD
-- ============================================
create or replace view admin_stats with (security_invoker = true) as
select
  (select count(*) from noticias) as total_noticias,
  (select count(*) from noticias where estado = 'publicado') as noticias_publicadas,
  (select count(*) from noticias where estado = 'borrador') as noticias_borrador,
  (select count(*) from eventos) as total_eventos,
  (select count(*) from eventos where estado = 'publicado') as eventos_publicados,
  (select count(*) from eventos where fecha_inicio >= now()) as eventos_proximos,
  (select count(*) from galeria) as total_imagenes,
  (select count(*) from testimonios where estado = 'aprobado') as testimonios_aprobados,
  (select count(*) from testimonios where estado = 'pendiente') as testimonios_pendientes,
  (select count(*) from motivational_quotes where is_active = true) as quotes_activas,
  (select count(*) from emotional_tips where is_active = true) as tips_activos,
  (select count(*) from mini_games where is_active = true) as juegos_activos,
  (select count(*) from appointments where status = 'pendiente') as citas_pendientes,
  (select count(*) from appointments where status = 'confirmada') as citas_confirmadas;

-- ============================================
-- 16. FUNCIÓN — REGISTRO DE PROGRESO EMOCIONAL
-- ============================================
create or replace function record_emotional_progress(
  p_emotional_state text,
  p_score integer default null
)
returns uuid
language sql
as $$
  insert into user_progress (user_id, emotional_state, score)
  values (auth.uid(), p_emotional_state, p_score)
  returning id;
$$;

-- ============================================
-- 17. ACTUALIZACIONES — AGENDA Y CITAS
-- ============================================

alter table appointments drop constraint if exists appointments_status_check;
alter table appointments add constraint appointments_status_check
  check (status in ('pendiente','confirmada','cancelada','completada','reagendada'));

alter table appointments add column if not exists emotional_state text;
alter table appointments add column if not exists consent boolean default false;
alter table appointments add column if not exists reagendada_date timestamptz;
alter table appointments add column if not exists updated_at timestamptz default now();
alter table appointments add column if not exists user_id uuid;
create index if not exists idx_appointments_user_id on appointments(user_id);

create trigger handle_updated_at_appointments before update on appointments
  for each row execute procedure moddatetime (updated_at);

-- ============================================
-- 18. USUARIO PERSISTENTE + PERFILES
-- ============================================

create table if not exists profiles (
  id uuid primary key,
  nickname text,
  avatar text,
  emotional_points integer default 0,
  level integer default 1,
  streak integer default 0,
  preferences jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_seen timestamptz default now()
);

alter table profiles enable row level security;

create policy "Perfiles insert público" on profiles
  for insert with check (true);

create policy "Perfiles select propio" on profiles
  for select using (true);

create policy "Perfiles update propio" on profiles
  for update using (auth.uid() = id or auth.uid() is null)
  with check (auth.uid() = id or auth.uid() is null);

create trigger handle_updated_at_profiles before update on profiles
  for each row execute procedure moddatetime (updated_at);

-- Mejorar user_progress
alter table user_progress add column if not exists activity_type text;
alter table user_progress add column if not exists activity_id uuid;
alter table user_progress add column if not exists completed boolean default true;
alter table user_progress add column if not exists updated_at timestamptz default now();

create trigger handle_updated_at_user_progress before update on user_progress
  for each row execute procedure moddatetime (updated_at);

-- ============================================
-- 19. TABLA — TOKENS DE NOTIFICACIONES PUSH
-- ============================================
create table if not exists push_tokens (
  id uuid default gen_random_uuid() primary key,
  token text not null unique,
  device text default 'android',
  user_id uuid,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table push_tokens enable row level security;

create policy "Insert propio tokens" on push_tokens
  for insert with check (true);

create policy "Select admin tokens" on push_tokens
  for select using (auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'editor'));

create policy "Update propio tokens" on push_tokens
  for update using (true) with check (true);

-- ============================================
-- 20. VISTA — ESTADÍSTICAS DE CITAS
-- ============================================
create or replace view admin_stats_appointments with (security_invoker = true) as
select
  status,
  count(*) as total,
  count(*) filter (where requested_date >= current_date) as proximas
from appointments
group by status;

-- ============================================
-- 21. POLÍTICA INSERT PÚBLICO — APPOINTMENTS
-- ============================================
create policy "Appointments insert public" on appointments
  for insert with check (true);

-- ============================================
-- 22. RPC — VER CITAS PROPIAS (SIN AUTH)
-- ============================================
-- Permite que usuarios anónimos (sin JWT) vean sus citas por email
-- usando security definer para bypassear RLS
create or replace function get_my_appointments(p_email text)
returns setof appointments
language sql
security definer
as $$
  select * from appointments where email = p_email order by created_at desc;
$$;

-- ============================================
-- 23. TABLA — NOTIFICACIONES INTERNAS
-- ============================================
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text,
  type text not null,
  image_url text,
  related_id uuid,
  related_table text,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

create policy "Notifications read all" on notifications
  for select using (true);

create policy "Notifications insert trigger" on notifications
  for insert with check (true);

create policy "Notifications update own" on notifications
  for update using (true) with check (true);

create policy "Notifications delete all" on notifications
  for delete using (true);

-- Triggers: insertar notificación automática cuando se crea contenido nuevo
create or replace function notify_on_content_insert()
returns trigger language plpgsql as $$
begin
  case TG_TABLE_NAME
    when 'eventos' then
      insert into notifications (title, body, type, related_id, related_table)
      values (new.titulo, coalesce(new.descripcion, ''), 'eventos', new.id, 'eventos');
    when 'noticias' then
      insert into notifications (title, body, type, related_id, related_table)
      values (new.titulo, coalesce(new.resumen, new.contenido, ''), 'noticias', new.id, 'noticias');
    when 'motivational_quotes' then
      insert into notifications (title, body, type, related_id, related_table)
      values (new.quote, coalesce(new.author, ''), 'motivational_quotes', new.id, 'motivational_quotes');
    when 'emotional_tips' then
      insert into notifications (title, body, type, related_id, related_table)
      values (new.title, coalesce(new.description, ''), 'emotional_tips', new.id, 'emotional_tips');
    when 'wellness_activities' then
      insert into notifications (title, body, type, related_id, related_table)
      values (new.title, coalesce(new.content, ''), 'wellness_activities', new.id, 'wellness_activities');
    when 'mini_games' then
      insert into notifications (title, body, type, related_id, related_table)
      values (new.title, coalesce(new.description, ''), 'mini_games', new.id, 'mini_games');
    else
      insert into notifications (title, body, type, related_id, related_table)
      values ('Novedad', '', TG_TABLE_NAME, new.id, TG_TABLE_NAME);
  end case;
  return new;
end;
$$;

create trigger trg_notify_eventos after insert on eventos
  for each row execute function notify_on_content_insert();
create trigger trg_notify_noticias after insert on noticias
  for each row execute function notify_on_content_insert();
create trigger trg_notify_quotes after insert on motivational_quotes
  for each row execute function notify_on_content_insert();
create trigger trg_notify_tips after insert on emotional_tips
  for each row execute function notify_on_content_insert();
create trigger trg_notify_activities after insert on wellness_activities
  for each row execute function notify_on_content_insert();
create trigger trg_notify_games after insert on mini_games
  for each row execute function notify_on_content_insert();

-- ============================================
-- 24. TABLA — ACUSE DE LECTURA POR DISPOSITIVO
-- ============================================
create table if not exists notification_ack (
  notification_id uuid not null references notifications(id) on delete cascade,
  device_id uuid not null,
  is_read boolean default false,
  dismissed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (notification_id, device_id)
);

alter table notification_ack enable row level security;

create policy "Notification ack all" on notification_ack
  for all using (true) with check (true);

-- Fix: Permitir upsert desde anon (necesario para PushNotificationsService.saveToken)
create policy "Select anon push_tokens upsert" on push_tokens
  for select using (true);

-- ============================================
-- 25. WEBHOOK — emotions → notify-content
-- ============================================
create trigger trg_webhook_emotions after insert on emotions
  for each row execute function supabase_functions.http_request(
    'https://nwmewlnwcmsdswmxynvj.functions.supabase.co/notify-content',
    'POST',
    '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bWV3bG53Y21zZHN3bXh5bnZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ5NTQ0NywiZXhwIjoyMDk1MDcxNDQ3fQ.V1KsvR6HnLxPaxdwR4ijN3l-9jPldiBMziYJwRcyYdo"}',
    '{}',
    '5000'
  );

-- ============================================
-- 26. WEBHOOK — appointments → notify-appointment
-- ============================================
create trigger trg_webhook_appointments after insert or update on appointments
  for each row execute function supabase_functions.http_request(
    'https://nwmewlnwcmsdswmxynvj.functions.supabase.co/notify-appointment',
    'POST',
    '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bWV3bG53Y21zZHN3bXh5bnZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ5NTQ0NywiZXhwIjoyMDk1MDcxNDQ3fQ.V1KsvR6HnLxPaxdwR4ijN3l-9jPldiBMziYJwRcyYdo"}',
    '{}',
    '5000'
  );

-- ============================================
-- 27. FUNCIÓN — AUTO-FINALIZAR EVENTOS VENCIDOS
-- ============================================
-- Se ejecuta desde el frontend (EventosService.autoFinalize())
-- y desde un cron opcional en Supabase.
-- Solo afecta eventos en estado 'publicado' o 'borrador'
-- que ya hayan superado su fecha_fin.
-- NO sobreescribe estados manuales: cancelado, pospuesto.
create or replace function auto_finalize_eventos()
returns integer
language plpgsql
security definer
as $$
declare
  v_updated integer;
begin
  update eventos
  set estado = 'finalizado'
  where fecha_fin < now()
    and estado in ('publicado', 'borrador')
    and fecha_fin is not null;
  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

-- NOTA: Si aparece 504 Gateway Timeout al crear eventos desde admin:
-- 1. Ir a Supabase Dashboard → Edge Functions → notify-event / notify-appointment
-- 2. Settings → aumentar timeout de 60s a 120s
-- 3. Verificar que FIREBASE_SERVICE_ACCOUNT esté configurado en Secrets
-- 4. Si el error persiste, desconectar temporalmente el webhook en Database → Webhooks

-- ============================================
-- NOTAS GENERALES (no ejecutar como SQL)
-- ============================================

-- GOOGLE PLAY CONSOLE — DATA SAFETY
-- ---------------------------------
-- Datos recolectados por la app:
-- · Información personal: email (solo si agenda cita)
-- · Actividad en app: emociones registradas, minijuegos completados
-- · Diagnósticos: crash reports (Android nativo)
-- No se comparten datos con terceros.
-- Cifrado en tránsito: HTTPS + Supabase TLS.
-- El permiso POST_NOTIFICATIONS se solicita en tiempo de ejecución (Android 13+).
-- No se recolecta ubicación, contactos, fotos ni micrófono.

-- SUPABASE EDGE FUNCTIONS — CONFIGURACIÓN
-- ----------------------------------------
-- Para activar notificaciones push push:
-- 1. Crear proyecto en Firebase Console
-- 2. Descargar google-services.json → android/app/
-- 3. En Supabase Dashboard → Edge Functions:
--    - Crear función 'notify-event'
--    - Crear función 'notify-appointment'
-- 4. En Supabase Dashboard → Database → Webhooks:
--    - Crear webhook para tabla 'eventos' (INSERT, UPDATE)
--      → URL: {project-ref}.functions.supabase.co/notify-event
--    - Crear webhook para tabla 'appointments' (INSERT, UPDATE)
--      → URL: {project-ref}.functions.supabase.co/notify-appointment
-- 5. Las Edge Functions deben usar firebase-admin SDK para enviar
--    notificaciones a los tokens registrados en push_tokens
