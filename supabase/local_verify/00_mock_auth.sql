-- Minimaler Mock des Supabase "auth"-Schemas, NUR für lokale RLS-Verifikation
-- gegen eine normale Postgres-Instanz (kein Docker in dieser Sandbox verfügbar).
-- Bildet exakt das nach, wovon unsere eigenen RLS-Policies abhängen: auth.uid()
-- und auth.users(id, email). Wird NICHT gegen echtes Supabase deployed.

create schema if not exists auth;

create table auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text not null
);

-- Im echten Supabase liefert auth.uid() die User-ID aus dem JWT der aktuellen
-- Session. Hier simulieren wir das über eine Session-Variable, die die
-- Testskripte per `set_config('app.current_user_id', ..., false)` setzen.
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('app.current_user_id', true), '')::uuid;
$$;

-- Mock für auth.jwt(): echtes Supabase liefert hier die JWT-Claims als jsonb
-- (inkl. "email"). Testskripte setzen `app.current_user_email` passend.
create or replace function auth.jwt() returns jsonb
language sql stable as $$
  select jsonb_build_object('email', nullif(current_setting('app.current_user_email', true), ''));
$$;

-- Realtime-Publication existiert in echten Supabase-Projekten bereits;
-- hier für Migration 0004 manuell anlegen.
create publication supabase_realtime;
