-- Non-superuser Rolle wie Supabase's "authenticated", damit RLS überhaupt
-- greift (der Tabellenbesitzer/Superuser würde RLS sonst umgehen).
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end $$;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.drivers, public.employees, public.employee_shift_assignments to authenticated;
grant usage on schema auth to authenticated;
grant select on auth.users to authenticated;

-- auth.users-Zeilen anlegen, die genau auf die geseedeten profiles matchen
-- (simuliert: alle Test-Personen haben ihre Einladung bereits angenommen).
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com'),
  ('00000000-0000-0000-0000-000000000010', 'fahrer.frueh@example.com'),
  ('00000000-0000-0000-0000-000000000011', 'fahrer.spaet@example.com'),
  ('00000000-0000-0000-0000-000000000012', 'fahrer.nacht@example.com'),
  ('00000000-0000-0000-0000-000000000020', 'maria@example.com'),
  ('00000000-0000-0000-0000-000000000021', 'peter@example.com');
-- auth_user_id wird durch den on_auth_user_created-Trigger (0003) automatisch
-- per E-Mail-Match gesetzt, hier NICHT manuell überschreiben (testet damit
-- gleich den echten Invite-Linking-Mechanismus mit).
