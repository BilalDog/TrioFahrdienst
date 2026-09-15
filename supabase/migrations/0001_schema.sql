-- Enums, core tables, and housekeeping triggers.

create type public.app_role as enum ('admin', 'driver', 'employee');
create type public.shift as enum ('fruh', 'spat', 'nacht');

-- One row per person, 1:1 with auth.users once the invite is accepted.
create table public.profiles (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users(id) on delete set null,
  role          public.app_role not null,
  full_name     text not null,
  email         text not null,
  phone         text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index profiles_email_idx on public.profiles (lower(email));

-- Fahrer: stabile Schicht-Zuordnung direkt am Datensatz.
create table public.drivers (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null unique references public.profiles(id) on delete cascade,
  shift        public.shift not null,
  vehicle_info text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Mitarbeiter: reine Stammdaten, kein Schicht-Feld hier.
create table public.employees (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null unique references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Wöchentliche Schicht-Zuteilung je Mitarbeiter.
create table public.employee_shift_assignments (
  id           uuid primary key default gen_random_uuid(),
  employee_id  uuid not null references public.employees(id) on delete cascade,
  week_start   date not null,
  shift        public.shift not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (employee_id, week_start)
);
create index employee_shift_assignments_week_idx on public.employee_shift_assignments (week_start);

create or replace function public.current_week_start() returns date
language sql stable as $$
  select date_trunc('week', current_date)::date;
$$;

create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_drivers_updated_at before update on public.drivers
  for each row execute function public.set_updated_at();
create trigger trg_employees_updated_at before update on public.employees
  for each row execute function public.set_updated_at();
create trigger trg_employee_shift_assignments_updated_at before update on public.employee_shift_assignments
  for each row execute function public.set_updated_at();
