"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { roleHomePath } from "@/lib/auth/roleHome";
import { supabase } from "@/lib/supabase/client";

export default function InvitePage() {
  const router = useRouter();
  const { session, profile, loading, refreshProfile } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== confirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    await refreshProfile();
    router.replace("/");
  }

  if (loading) {
    return <CenteredMessage text="Lade…" />;
  }

  if (!session) {
    return (
      <CenteredMessage text="Dieser Einladungslink ist ungültig oder abgelaufen. Bitte wende dich an einen Admin für eine neue Einladung." />
    );
  }

  if (profile) {
    router.replace(roleHomePath(profile.role));
    return <CenteredMessage text="Weiterleitung…" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">Willkommen bei TrioFahrdienst</h1>
        <p className="mb-6 text-sm text-slate-500">
          Lege ein Passwort für dein Konto fest, um loszulegen.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="confirm">
              Passwort bestätigen
            </label>
            <input
              id="confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Speichert…" : "Passwort speichern & loslegen"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CenteredMessage({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}
