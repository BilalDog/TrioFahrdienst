import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server ist nicht vollständig konfiguriert (Supabase-Umgebungsvariablen fehlen)." },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const profileId = body?.profileId as string | undefined;
  if (!profileId) {
    return NextResponse.json({ error: "profileId fehlt." }, { status: 400 });
  }

  // Client im Namen des aufrufenden Nutzers - respektiert RLS, verifiziert
  // dadurch gleichzeitig, dass der Token gültig ist.
  const userClient = createClient<Database>(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: "Ungültige Sitzung." }, { status: 401 });
  }

  const { data: callerProfile } = await userClient
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (callerProfile?.role !== "admin") {
    return NextResponse.json(
      { error: "Nur Admins dürfen Einladungen versenden." },
      { status: 403 },
    );
  }

  const { data: targetProfile, error: targetError } = await userClient
    .from("profiles")
    .select("email, auth_user_id")
    .eq("id", profileId)
    .maybeSingle();

  if (targetError || !targetProfile) {
    return NextResponse.json({ error: "Person nicht gefunden." }, { status: 404 });
  }
  if (targetProfile.auth_user_id) {
    return NextResponse.json(
      { error: "Diese Person hat die Einladung bereits angenommen." },
      { status: 409 },
    );
  }

  const serviceClient = createClient<Database>(supabaseUrl, serviceRoleKey);
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  const { error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
    targetProfile.email,
    { redirectTo: `${origin}/invite` },
  );

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
