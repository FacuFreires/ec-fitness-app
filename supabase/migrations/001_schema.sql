-- Enable uuid extension
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
create table public.perfiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nombre text not null,
  email text not null,
  rol text not null check (rol in ('admin', 'alumno')),
  fecha_pago date,
  fecha_vencimiento date,
  id_entrenador uuid references public.perfiles(id),
  created_at timestamptz default now()
);

alter table public.perfiles enable row level security;

-- Admin sees all profiles; alumno sees only own
create policy "admin_all_perfiles" on public.perfiles
  for all using (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin')
  );
create policy "alumno_own_perfil" on public.perfiles
  for select using (id = auth.uid());

-- =============================================
-- EJERCICIOS MASTER TABLE
-- =============================================
create table public.ejercicios_master (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  musculo text not null,
  gif_url text,
  descripcion text,
  created_at timestamptz default now()
);

alter table public.ejercicios_master enable row level security;

create policy "admin_crud_ejercicios" on public.ejercicios_master
  for all using (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin')
  );
create policy "alumno_read_ejercicios" on public.ejercicios_master
  for select using (auth.role() = 'authenticated');

-- =============================================
-- RUTINAS TABLE
-- =============================================
create table public.rutinas (
  id uuid primary key default uuid_generate_v4(),
  alumno_id uuid references public.perfiles(id) on delete cascade not null,
  nombre_rutina text not null,
  activo boolean default true,
  creado_at timestamptz default now()
);

alter table public.rutinas enable row level security;

create policy "admin_crud_rutinas" on public.rutinas
  for all using (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin')
  );
create policy "alumno_read_own_rutinas" on public.rutinas
  for select using (alumno_id = auth.uid());

-- =============================================
-- RUTINA EJERCICIOS TABLE
-- =============================================
create table public.rutina_ejercicios (
  id uuid primary key default uuid_generate_v4(),
  rutina_id uuid references public.rutinas(id) on delete cascade not null,
  ejercicio_id uuid references public.ejercicios_master(id) on delete cascade not null,
  series integer not null default 3,
  repeticiones integer not null default 10,
  tiempo_descanso integer not null default 60,
  orden integer not null default 0
);

alter table public.rutina_ejercicios enable row level security;

create policy "admin_crud_rutina_ejercicios" on public.rutina_ejercicios
  for all using (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin')
  );
create policy "alumno_read_own_rutina_ejercicios" on public.rutina_ejercicios
  for select using (
    exists (
      select 1 from public.rutinas r
      where r.id = rutina_id and r.alumno_id = auth.uid()
    )
  );

-- =============================================
-- LOGS PROGRESO TABLE
-- =============================================
create table public.logs_progreso (
  id uuid primary key default uuid_generate_v4(),
  alumno_id uuid references public.perfiles(id) on delete cascade not null,
  ejercicio_id uuid references public.ejercicios_master(id) not null,
  rutina_ejercicio_id uuid references public.rutina_ejercicios(id),
  peso_cargado numeric(5,2),
  reps_hechas integer,
  fecha date default current_date,
  created_at timestamptz default now()
);

alter table public.logs_progreso enable row level security;

create policy "admin_read_all_logs" on public.logs_progreso
  for select using (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin')
  );
create policy "alumno_insert_own_logs" on public.logs_progreso
  for insert with check (alumno_id = auth.uid());
create policy "alumno_read_own_logs" on public.logs_progreso
  for select using (alumno_id = auth.uid());

-- =============================================
-- FUNCTION: auto-insert perfil on signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, nombre, email, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'rol', 'alumno')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
