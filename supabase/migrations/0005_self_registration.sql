-- Erlaubt Selbstregistrierung: ein frisch angemeldeter Nutzer ohne
-- profiles-Zeile darf sich selbst als Fahrer ODER Mitarbeiter anlegen
-- (niemals als Admin), zwingend inaktiv, bis ein Admin freischaltet.

create policy profiles_insert_self on public.profiles
  for insert with check (
    auth_user_id = auth.uid()
    and role in ('driver', 'employee')
    and is_active = false
    and email = (auth.jwt() ->> 'email')
  );

create policy drivers_insert_self on public.drivers
  for insert with check (
    profile_id = (public.my_profile()).id
    and public.my_role() = 'driver'
  );

create policy employees_insert_self on public.employees
  for insert with check (
    profile_id = (public.my_profile()).id
    and public.my_role() = 'employee'
  );
