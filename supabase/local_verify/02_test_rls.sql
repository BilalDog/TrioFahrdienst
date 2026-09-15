\echo '=== ADMIN (Anna) sollte alles sehen ==='
set role authenticated;
select set_config('app.current_user_id', '00000000-0000-0000-0000-000000000001', false);
select 'profiles' as tbl, count(*) from public.profiles
union all select 'drivers', count(*) from public.drivers
union all select 'employees', count(*) from public.employees
union all select 'employee_shift_assignments', count(*) from public.employee_shift_assignments;
reset role;

\echo '=== FAHRER (Frank) sollte alles LESEN, aber nichts SCHREIBEN duerfen ==='
set role authenticated;
select set_config('app.current_user_id', '00000000-0000-0000-0000-000000000010', false);
select 'profiles' as tbl, count(*) from public.profiles
union all select 'drivers', count(*) from public.drivers
union all select 'employees', count(*) from public.employees
union all select 'employee_shift_assignments', count(*) from public.employee_shift_assignments;
\echo '-- Schreibversuch (muss fehlschlagen/0 Zeilen betreffen):'
update public.drivers set vehicle_info = 'HACK' where true;
reset role;

\echo '=== MITARBEITER Maria (diese Woche: fruh) sollte NUR Fahrer Frank (fruh) sehen ==='
set role authenticated;
select set_config('app.current_user_id', '00000000-0000-0000-0000-000000000020', false);
select full_name, role from public.profiles order by full_name;
select shift, vehicle_info from public.drivers order by shift;
select full_name from public.employees; -- ueber profiles join eigentlich, hier nur id-count relevant
select 'employees_visible' as info, count(*) from public.employees;
select week_start, shift from public.employee_shift_assignments order by week_start;
reset role;

\echo '=== MITARBEITER Peter (diese & naechste Woche: spat) sollte NUR Fahrerin Sina (spat) sehen ==='
set role authenticated;
select set_config('app.current_user_id', '00000000-0000-0000-0000-000000000021', false);
select full_name, role from public.profiles order by full_name;
select shift, vehicle_info from public.drivers order by shift;
reset role;

\echo '=== Sanity: Maria darf NICHT Peters employee_shift_assignments sehen ==='
set role authenticated;
select set_config('app.current_user_id', '00000000-0000-0000-0000-000000000020', false);
select count(*) as sollte_0_sein from public.employee_shift_assignments
  where employee_id = '00000000-0000-0000-0000-000000000031';
reset role;
