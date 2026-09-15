-- Tabellen für Live-Updates in der Realtime-Publication freischalten.

alter publication supabase_realtime add table public.drivers;
alter publication supabase_realtime add table public.employees;
alter publication supabase_realtime add table public.employee_shift_assignments;
alter publication supabase_realtime add table public.profiles;
