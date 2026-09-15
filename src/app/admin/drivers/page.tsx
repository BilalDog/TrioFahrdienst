"use client";

import { useState } from "react";
import {
  useDrivers,
  useCreateDriver,
  useUpdateDriver,
  type DriverWithProfile,
} from "@/lib/queries/drivers";
import { useSetProfileActive, useDeleteProfile } from "@/lib/queries/profiles";
import { useInvitePerson } from "@/lib/queries/invite";
import { ShiftBadge } from "@/components/shared/ShiftBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SHIFT_ORDER, SHIFT_LABELS, type Shift } from "@/lib/supabase/types";

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  shift: Shift;
  vehicle_info: string;
}

const emptyForm: FormState = {
  full_name: "",
  email: "",
  phone: "",
  shift: "fruh",
  vehicle_info: "",
};

export default function AdminDriversPage() {
  const { data: drivers, isLoading } = useDrivers();
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const setActive = useSetProfileActive();
  const deleteProfile = useDeleteProfile();
  const invitePerson = useInvitePerson();

  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  async function handleInvite(profileId: string) {
    setInviteMessage(null);
    try {
      await invitePerson.mutateAsync(profileId);
      setInviteMessage("Einladung verschickt.");
    } catch (err) {
      setInviteMessage(err instanceof Error ? err.message : "Einladen fehlgeschlagen.");
    }
  }

  function startCreate() {
    setForm(emptyForm);
    setError(null);
    setEditingId("new");
  }

  function startEdit(driver: DriverWithProfile) {
    setForm({
      full_name: driver.profile.full_name,
      email: driver.profile.email,
      phone: driver.profile.phone ?? "",
      shift: driver.shift,
      vehicle_info: driver.vehicle_info ?? "",
    });
    setError(null);
    setEditingId(driver.id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId === "new") {
        await createDriver.mutateAsync(form);
      } else if (editingId) {
        const driver = drivers?.find((d) => d.id === editingId);
        if (!driver) return;
        await updateDriver.mutateAsync({
          driverId: driver.id,
          profileId: driver.profile_id,
          ...form,
        });
      }
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    }
  }

  async function handleDelete(profileId: string, name: string) {
    if (!confirm(`Fahrer "${name}" wirklich endgültig entfernen?`)) return;
    await deleteProfile.mutateAsync(profileId);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Fahrer</h1>
        <button
          onClick={startCreate}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          + Neuer Fahrer
        </button>
      </div>

      {editingId && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
        >
          <h2 className="text-sm font-semibold">
            {editingId === "new" ? "Neuen Fahrer anlegen" : "Fahrer bearbeiten"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="E-Mail">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Telefon">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Schicht">
              <select
                value={form.shift}
                onChange={(e) => setForm({ ...form, shift: e.target.value as Shift })}
                className="input"
              >
                {SHIFT_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {SHIFT_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Fahrzeug (optional)">
              <input
                value={form.vehicle_info}
                onChange={(e) => setForm({ ...form, vehicle_info: e.target.value })}
                className="input"
              />
            </Field>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createDriver.isPending || updateDriver.isPending}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Speichern
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {inviteMessage && <p className="text-sm text-slate-600">{inviteMessage}</p>}

      {isLoading ? (
        <p className="text-sm text-slate-500">Lade…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Schicht</th>
                <th className="px-4 py-2">Kontakt</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Konto</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {drivers?.map((driver) => (
                <tr key={driver.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium">{driver.profile.full_name}</td>
                  <td className="px-4 py-2">
                    <ShiftBadge shift={driver.shift} />
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {driver.profile.email}
                    {driver.profile.phone ? ` · ${driver.profile.phone}` : ""}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge isActive={driver.profile.is_active} />
                  </td>
                  <td className="px-4 py-2">
                    {driver.profile.auth_user_id ? (
                      <span className="text-xs text-emerald-700">Registriert</span>
                    ) : (
                      <button
                        onClick={() => handleInvite(driver.profile_id)}
                        disabled={invitePerson.isPending}
                        className="text-xs text-slate-600 hover:underline disabled:opacity-50"
                      >
                        Einladen
                      </button>
                    )}
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-2 text-right">
                    <button
                      onClick={() => startEdit(driver)}
                      className="text-slate-600 hover:underline"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() =>
                        setActive.mutate({
                          profileId: driver.profile_id,
                          isActive: !driver.profile.is_active,
                        })
                      }
                      className="text-slate-600 hover:underline"
                    >
                      {driver.profile.is_active ? "Deaktivieren" : "Aktivieren"}
                    </button>
                    <button
                      onClick={() => handleDelete(driver.profile_id, driver.profile.full_name)}
                      className="text-red-600 hover:underline"
                    >
                      Entfernen
                    </button>
                  </td>
                </tr>
              ))}
              {drivers?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Noch keine Fahrer angelegt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
    </label>
  );
}
