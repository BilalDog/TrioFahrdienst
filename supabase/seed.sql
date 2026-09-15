-- Beispieldaten für die lokale Entwicklung. Erst nachdem echte Nutzer per
-- Einladungs-Link registriert wurden, bekommen die profiles-Zeilen unten
-- ihre auth_user_id (siehe 0003_invite_linking.sql).

insert into public.profiles (id, role, full_name, email, phone, is_active) values
  ('00000000-0000-0000-0000-000000000001', 'admin',    'Anna Admin',      'admin@example.com',    '+49 170 0000001', true),
  ('00000000-0000-0000-0000-000000000010', 'driver',   'Frank Früh',      'fahrer.frueh@example.com', '+49 170 0000010', true),
  ('00000000-0000-0000-0000-000000000011', 'driver',   'Sina Spät',       'fahrer.spaet@example.com', '+49 170 0000011', true),
  ('00000000-0000-0000-0000-000000000012', 'driver',   'Norbert Nacht',   'fahrer.nacht@example.com', '+49 170 0000012', true),
  ('00000000-0000-0000-0000-000000000020', 'employee', 'Maria Mitarbeiter', 'maria@example.com', '+49 170 0000020', true),
  ('00000000-0000-0000-0000-000000000021', 'employee', 'Peter Mitarbeiter', 'peter@example.com', '+49 170 0000021', true);

insert into public.drivers (profile_id, shift, vehicle_info) values
  ('00000000-0000-0000-0000-000000000010', 'fruh', 'VW Caddy, B-FR 100'),
  ('00000000-0000-0000-0000-000000000011', 'spat', 'VW Caddy, B-SP 200'),
  ('00000000-0000-0000-0000-000000000012', 'nacht', 'VW Caddy, B-NA 300');

insert into public.employees (id, profile_id) values
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000020'),
  ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000021');

-- Maria: diese Woche Früh, Peter: diese Woche Spät.
insert into public.employee_shift_assignments (employee_id, week_start, shift) values
  ('00000000-0000-0000-0000-000000000030', public.current_week_start(), 'fruh'),
  ('00000000-0000-0000-0000-000000000031', public.current_week_start(), 'spat');

-- Nächste Woche bereits bekannt: Maria wechselt auf Nacht, Peter bleibt Spät.
insert into public.employee_shift_assignments (employee_id, week_start, shift) values
  ('00000000-0000-0000-0000-000000000030', public.current_week_start() + 7, 'nacht'),
  ('00000000-0000-0000-0000-000000000031', public.current_week_start() + 7, 'spat');
