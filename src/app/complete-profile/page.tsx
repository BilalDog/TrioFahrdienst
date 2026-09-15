"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { roleHomePath } from "@/lib/auth/roleHome";
import { useCompleteProfile } from "@/lib/queries/selfRegistration";
import { SHIFT_ORDER, SHIFT_LABELS, type Shift } from "@/lib/supabase/types";

type RoleChoice = "driver" | "employee";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { session, profile, loading, refreshProfile } = useAuth();
  const completeProfile = useCompleteProfile();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<RoleChoice>("employee");
  const [shift, setShift] = useState<Shift>("fruh");
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (loading || done) return;
    if (!session) {
      router.replace("/login");
    } else if (profile) {
      router.replace(roleHomePath(profile.role));
    }
  }, [loading, session, profile, done, router]);

  if (loading) {
    return <CenteredMessage text="Lade…" />;
  }
  if (!session || profile) {
    return <CenteredMessage text="Weiterleitung…" />;
  }

  if (done) {
    return (
      <CenteredMessage text="Danke! Dein Konto wurde angelegt und wartet jetzt auf die Freischaltung durch einen Admin." />
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await completeProfile.mutateAsync({
        role,
        full_name: fullName,
        phone,
        shift: role === "driver" ? shift : undefined,
        vehicle_info: role === "driver" ? vehicleInfo : undefined,
      });
      await refreshProfile();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">Profil vervollständigen</h1>
        <p className="mb-6 text-sm text-slate-500">
          Noch ein paar Angaben, dann kann ein Admin dein Konto freischalten.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="fullName">
              Name
            </label>
            <input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="phone">
              Telefon (optional)
            </label>
            <input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium">Ich bin</span>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="role"
                  checked={role === "employee"}
                  onChange={() => setRole("employee")}
                />
                Mitarbeiter
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="role"
                  checked={role === "driver"}
                  onChange={() => setRole("driver")}
                />
                Fahrer
              </label>
            </div>
          </div>
          {role === "driver" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="shift">
                  Schicht
                </label>
                <select
                  id="shift"
                  value={shift}
                  onChange={(e) => setShift(e.target.value as Shift)}
                  className="input"
                >
                  {SHIFT_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {SHIFT_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="vehicleInfo">
                  Fahrzeug (optional)
                </label>
                <input
                  id="vehicleInfo"
                  value={vehicleInfo}
                  onChange={(e) => setVehicleInfo(e.target.value)}
                  className="input"
                />
              </div>
            </>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={completeProfile.isPending}
            className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {completeProfile.isPending ? "Speichert…" : "Registrierung abschließen"}
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
