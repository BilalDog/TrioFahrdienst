"use client";

import { useState } from "react";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  type EmployeeWithProfile,
} from "@/lib/queries/employees";
import { useSetProfileActive, useDeleteProfile } from "@/lib/queries/profiles";
import { useInvitePerson } from "@/lib/queries/invite";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface FormState {
  full_name: string;
  email: string;
  phone: string;
}

const emptyForm: FormState = { full_name: "", email: "", phone: "" };

export default function AdminEmployeesPage() {
  const { data: employees, isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
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

  function startEdit(employee: EmployeeWithProfile) {
    setForm({
      full_name: employee.profile.full_name,
      email: employee.profile.email,
      phone: employee.profile.phone ?? "",
    });
    setError(null);
    setEditingId(employee.id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId === "new") {
        await createEmployee.mutateAsync(form);
      } else if (editingId) {
        const employee = employees?.find((emp) => emp.id === editingId);
        if (!employee) return;
        await updateEmployee.mutateAsync({ profileId: employee.profile_id, ...form });
      }
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    }
  }

  async function handleDelete(profileId: string, name: string) {
    if (!confirm(`Mitarbeiter "${name}" wirklich endgültig entfernen?`)) return;
    await deleteProfile.mutateAsync(profileId);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Mitarbeiter</h1>
        <button
          onClick={startCreate}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          + Neuer Mitarbeiter
        </button>
      </div>

      <p className="text-sm text-slate-500">
        Die wöchentliche Schicht wird nicht hier, sondern im{" "}
        <a href="/admin/schedule" className="underline">
          Wochenplan
        </a>{" "}
        gepflegt.
      </p>

      {editingId && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
        >
          <h2 className="text-sm font-semibold">
            {editingId === "new" ? "Neuen Mitarbeiter anlegen" : "Mitarbeiter bearbeiten"}
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
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createEmployee.isPending || updateEmployee.isPending}
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
                <th className="px-4 py-2">Kontakt</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Konto</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {employees?.map((employee) => (
                <tr key={employee.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium">{employee.profile.full_name}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {employee.profile.email}
                    {employee.profile.phone ? ` · ${employee.profile.phone}` : ""}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge isActive={employee.profile.is_active} />
                  </td>
                  <td className="px-4 py-2">
                    {employee.profile.auth_user_id ? (
                      <span className="text-xs text-emerald-700">Registriert</span>
                    ) : (
                      <button
                        onClick={() => handleInvite(employee.profile_id)}
                        disabled={invitePerson.isPending}
                        className="text-xs text-slate-600 hover:underline disabled:opacity-50"
                      >
                        Einladen
                      </button>
                    )}
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-2 text-right">
                    <button
                      onClick={() => startEdit(employee)}
                      className="text-slate-600 hover:underline"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() =>
                        setActive.mutate({
                          profileId: employee.profile_id,
                          isActive: !employee.profile.is_active,
                        })
                      }
                      className="text-slate-600 hover:underline"
                    >
                      {employee.profile.is_active ? "Deaktivieren" : "Aktivieren"}
                    </button>
                    <button
                      onClick={() => handleDelete(employee.profile_id, employee.profile.full_name)}
                      className="text-red-600 hover:underline"
                    >
                      Entfernen
                    </button>
                  </td>
                </tr>
              ))}
              {employees?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Noch keine Mitarbeiter angelegt.
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
