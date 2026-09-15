\echo '=== Neuer auth.users-Eintrag fuer Selbstregistrierungs-Test ==='
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000099', 'neuling@example.com');

\echo '=== Versuch 1: role=driver, is_active=TRUE -> MUSS FEHLSCHLAGEN ==='
set role authenticated;
select set_config('app.current_user_id', '00000000-0000-0000-0000-000000000099', false);
select set_config('app.current_user_email', 'neuling@example.com', false);
insert into public.profiles (auth_user_id, role, full_name, email, is_active)
values ('00000000-0000-0000-0000-000000000099', 'driver', 'Neuling', 'neuling@example.com', true);
reset role;

\echo '=== Versuch 2: role=admin -> MUSS FEHLSCHLAGEN (auch mit is_active=false) ==='
set role authenticated;
select set_config('app.current_user_id', '00000000-0000-0000-0000-000000000099', false);
select set_config('app.current_user_email', 'neuling@example.com', false);
insert into public.profiles (auth_user_id, role, full_name, email, is_active)
values ('00000000-0000-0000-0000-000000000099', 'admin', 'Neuling', 'neuling@example.com', false);
reset role;

\echo '=== Versuch 3: fremde E-Mail spoofen -> MUSS FEHLSCHLAGEN ==='
set role authenticated;
select set_config('app.current_user_id', '00000000-0000-0000-0000-000000000099', false);
select set_config('app.current_user_email', 'neuling@example.com', false);
insert into public.profiles (auth_user_id, role, full_name, email, is_active)
values ('00000000-0000-0000-0000-000000000099', 'driver', 'Neuling', 'fremde@example.com', false);
reset role;

\echo '=== Versuch 4: role=driver, is_active=FALSE -> MUSS KLAPPEN ==='
set role authenticated;
select set_config('app.current_user_id', '00000000-0000-0000-0000-000000000099', false);
select set_config('app.current_user_email', 'neuling@example.com', false);
insert into public.profiles (auth_user_id, role, full_name, email, is_active)
values ('00000000-0000-0000-0000-000000000099', 'driver', 'Neuling', 'neuling@example.com', false)
returning id, role, is_active;
reset role;

\echo '=== Versuch 5: passende drivers-Zeile fuer sich selbst anlegen -> MUSS KLAPPEN ==='
set role authenticated;
select set_config('app.current_user_id', '00000000-0000-0000-0000-000000000099', false);
select set_config('app.current_user_email', 'neuling@example.com', false);
insert into public.drivers (profile_id, shift)
select id, 'fruh' from public.profiles where auth_user_id = '00000000-0000-0000-0000-000000000099'
returning id, shift;
reset role;

\echo '=== Sanity: der neue (inaktive) Fahrer darf NICHTS lesen, was ueber is_active=true-Sichtbarkeit hinausgeht (nur eigenes Profil) ==='
set role authenticated;
select set_config('app.current_user_id', '00000000-0000-0000-0000-000000000099', false);
select full_name, role, is_active from public.profiles where auth_user_id = '00000000-0000-0000-0000-000000000099';
reset role;

\echo '=== Aufraeumen ==='
delete from public.drivers where profile_id in (select id from public.profiles where auth_user_id = '00000000-0000-0000-0000-000000000099');
delete from public.profiles where auth_user_id = '00000000-0000-0000-0000-000000000099';
delete from auth.users where id = '00000000-0000-0000-0000-000000000099';
