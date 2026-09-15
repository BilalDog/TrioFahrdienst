-- Verknüpft einen frisch registrierten auth.users-Eintrag per E-Mail-Match
-- automatisch mit dem vom Admin vorab angelegten profiles-Datensatz.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
    set auth_user_id = new.id
    where lower(email) = lower(new.email)
      and auth_user_id is null;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
