-- Row-Level-Security: Admin (voller Zugriff), Fahrer (lesend alles),
-- Mitarbeiter (nur eigene Daten + Fahrer der eigenen wöchentlichen Schicht).

alter table public.profiles enable row level security;
alter table public.drivers enable row level security;
alter table public.employees enable row level security;
alter table public.employee_shift_assignments enable row level security;

create or replace function public.my_profile()
returns public.profiles
language sql
security definer
stable
set search_path = public
as $$
  select * from public.profiles where auth_user_id = auth.uid();
$$;

create or replace function public.my_role() returns public.app_role
language sql security definer stable set search_path = public as $$
  select role from public.profiles where auth_user_id = auth.uid();
$$;

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where auth_user_id = auth.uid()), false);
$$;

-- ═══════════════════════════════════════════════════════════════════
-- profiles
-- ═══════════════════════════════════════════════════════════════════

create policy profiles_select_admin on public.profiles
  for select using (public.is_admin());

create policy profiles_select_driver on public.profiles
  for select using (public.my_role() = 'driver');

create policy profiles_select_self on public.profiles
  for select using (auth_user_id = auth.uid());

-- Mitarbeiter darf das Profil eines Fahrers lesen, dessen Schicht mit einer
-- der eigenen wöchentlichen Zuteilungen übereinstimmt.
create policy profiles_select_employee_own_driver on public.profiles
  for select using (
    public.my_role() = 'employee'
    and id in (
      select d.profile_id
      from public.drivers d
      where d.shift in (
        select esa.shift
        from public.employee_shift_assignments esa
        join public.employees e on e.id = esa.employee_id
        where e.profile_id = (public.my_profile()).id
      )
    )
  );

create policy profiles_insert_admin on public.profiles for insert with check (public.is_admin());
create policy profiles_update_admin on public.profiles for update using (public.is_admin());
create policy profiles_delete_admin on public.profiles for delete using (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
-- drivers
-- ═══════════════════════════════════════════════════════════════════

create policy drivers_select_admin on public.drivers
  for select using (public.is_admin());

create policy drivers_select_driver on public.drivers
  for select using (public.my_role() = 'driver');

create policy drivers_select_employee on public.drivers
  for select using (
    public.my_role() = 'employee'
    and shift in (
      select esa.shift
      from public.employee_shift_assignments esa
      join public.employees e on e.id = esa.employee_id
      where e.profile_id = (public.my_profile()).id
    )
  );

create policy drivers_insert_admin on public.drivers for insert with check (public.is_admin());
create policy drivers_update_admin on public.drivers for update using (public.is_admin());
create policy drivers_delete_admin on public.drivers for delete using (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
-- employees
-- ═══════════════════════════════════════════════════════════════════

create policy employees_select_admin on public.employees
  for select using (public.is_admin());

create policy employees_select_driver on public.employees
  for select using (public.my_role() = 'driver');

create policy employees_select_self on public.employees
  for select using (profile_id = (public.my_profile()).id);

create policy employees_insert_admin on public.employees for insert with check (public.is_admin());
create policy employees_update_admin on public.employees for update using (public.is_admin());
create policy employees_delete_admin on public.employees for delete using (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
-- employee_shift_assignments
-- ═══════════════════════════════════════════════════════════════════

create policy esa_select_admin on public.employee_shift_assignments
  for select using (public.is_admin());

create policy esa_select_driver on public.employee_shift_assignments
  for select using (public.my_role() = 'driver');

create policy esa_select_self on public.employee_shift_assignments
  for select using (
    employee_id in (select id from public.employees where profile_id = (public.my_profile()).id)
  );

create policy esa_insert_admin on public.employee_shift_assignments for insert with check (public.is_admin());
create policy esa_update_admin on public.employee_shift_assignments for update using (public.is_admin());
create policy esa_delete_admin on public.employee_shift_assignments for delete using (public.is_admin());
