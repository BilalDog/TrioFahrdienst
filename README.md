# TrioFahrdienst

Web-App (Next.js) zur Koordination von Fahrern und Mitarbeitern im Fahrdienst.
Admins verwalten Fahrer und Mitarbeiter sowie den wöchentlichen Schichtplan;
Fahrer sehen alles lesend; Mitarbeiter sehen nur, wer sie in ihrer aktuellen
bzw. bereits bekannten kommenden Schicht abholt. Läuft direkt im Browser
(Desktop und Mobil), keine native App nötig.

## Setup

### 1. Supabase-Projekt

Diese App braucht ein Supabase-Projekt (Postgres + Auth + Realtime):

1. Projekt auf [supabase.com](https://supabase.com) anlegen (oder lokal via
   [Supabase CLI](https://supabase.com/docs/guides/local-development) und
   Docker, falls in deiner Umgebung verfügbar — in dieser Entwicklungs-Sandbox
   war Docker-Image-Zugriff blockiert, daher wurde das Schema stattdessen
   gegen eine normale lokale Postgres-Instanz verifiziert, siehe
   `supabase/local_verify/`).
2. Die SQL-Migrationen unter `supabase/migrations/` in dieser Reihenfolge
   ausführen (SQL-Editor im Supabase-Dashboard, oder `supabase db push` bei
   verlinktem Projekt):
   - `0001_schema.sql` — Tabellen, Enums
   - `0002_rls.sql` — Row-Level-Security (Admin/Fahrer/Mitarbeiter-Rechte)
   - `0003_invite_linking.sql` — verknüpft angenommene Einladungen automatisch
   - `0004_realtime.sql` — aktiviert Live-Updates für die vier Tabellen
3. Optional `supabase/seed.sql` ausführen für Beispieldaten.
4. In den Supabase-Auth-Einstellungen die **Redirect URL** auf
   `<deine-domain>/invite` setzen (und für lokale Entwicklung zusätzlich
   `http://localhost:3000/invite`).

### 2. Umgebungsvariablen

`.env.local.example` nach `.env.local` kopieren und mit den echten Werten aus
Supabase (Project Settings → API) befüllen:

```bash
cp .env.local.example .env.local
```

`SUPABASE_SERVICE_ROLE_KEY` wird nur serverseitig für den Einladungs-Versand
(`/api/invite`) genutzt und darf niemals ins Frontend gelangen.

### 3. App starten

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

## Rollen

| Rolle | Rechte |
|---|---|
| Admin | Fahrer/Mitarbeiter anlegen, bearbeiten, aktivieren/deaktivieren, entfernen; Wochenplan pflegen; Einladungen versenden |
| Fahrer | Alles lesend einsehen (alle Fahrer, alle Mitarbeiter, Wochenplan) |
| Mitarbeiter | Nur die eigene Schicht + passende(r) Fahrer mit Kontaktdaten |

Neue Personen werden von einem Admin angelegt (Name, E-Mail, Kontakt) und
erhalten danach über den "Einladen"-Button eine E-Mail mit Link, über den sie
selbst ein Passwort setzen.

## Struktur

```
src/app/          Next.js App-Router-Seiten (admin/, driver/, employee/, api/invite/)
src/lib/auth/      Auth-Context, Rollen-Guard
src/lib/queries/   React-Query-Hooks für Supabase-Zugriff + Realtime-Sync
src/lib/supabase/  Supabase-Client + Datenbank-Typen
supabase/          SQL-Migrationen, Seed-Daten
```

## Deployment über Vercel (verbunden mit GitHub)

Die App ist eine ganz normale Next.js-Webseite (kein Docker/Capacitor nötig).
Reines GitHub Pages funktioniert **nicht**, da `/api/invite` echten Server-
Code braucht (hält den geheimen Service-Role-Key) — GitHub Pages liefert nur
statische Dateien aus. Stattdessen: [Vercel](https://vercel.com), automatisch
mit dem GitHub-Repo verbunden — führt echten Server-Code aus und deployed bei
jedem Push automatisch neu.

1. Mit dem GitHub-Account auf [vercel.com](https://vercel.com) einloggen →
   "Add New Project" → Repository `BilalDog/TrioFahrdienst` importieren.
   Next.js wird automatisch erkannt (kein `vercel.json` nötig).
2. Als Production-Branch `claude/festive-feynman-l4nwqx` wählen (oder zuvor
   in den Standard-Branch mergen).
3. Unter Project Settings → Environment Variables dieselben drei Variablen
   wie in `.env.local.example` setzen (`SUPABASE_SERVICE_ROLE_KEY` als
   Secret markieren). Voraussetzung: das Supabase-Projekt aus Schritt 1 oben
   existiert bereits.
4. Deploy läuft automatisch; die App ist danach unter einer
   `*.vercel.app`-URL live.
5. In den Supabase-Auth-Einstellungen die Redirect-URL um
   `<vercel-domain>/invite` ergänzen, sonst funktioniert der Einladungslink
   in Produktion nicht.
