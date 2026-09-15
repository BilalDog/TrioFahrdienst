"use client";

import { useMemo, useState } from "react";
import { useEmployees, type EmployeeWithProfile } from "@/lib/queries/employees";
import { useWeekAssignments, useSaveWeekAssignments } from "@/lib/queries/assignments";
import { SHIFT_ORDER, SHIFT_LABELS, type Shift } from "@/lib/supabase/types";
import {
  currentWeekStartIso,
  nextWeekStartIso,
  addWeeks,
  toIsoDate,
  formatWeekLabel,
} from "@/lib/week";

const NO_SHIFT = "" as const;
type ShiftOrEmpty = Shift | typeof NO_SHIFT;

export default function AdminSchedulePage() {
  const { data: employees, isLoading: employeesLoading } = useEmployees();

  const weekOptions = useMemo(() => {
    const base = new Date(currentWeekStartIso() + "T00:00:00");
    return [-1, 0, 1, 2].map((offset) => toIsoDate(addWeeks(base, offset)));
  }, []);

  const [weekStartIso, setWeekStartIso] = useState(nextWeekStartIso());
  const activeEmployees = (employees ?? []).filter((e) => e.profile.is_active);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Wochenplan</h1>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Woche:</span>
          <select
            value={weekStartIso}
            onChange={(e) => setWeekStartIso(e.target.value)}
            className="input w-auto"
          >
            {weekOptions.map((w) => (
              <option key={w} value={w}>
                {formatWeekLabel(w)}
                {w === currentWeekStartIso() ? " (diese Woche)" : ""}
                {w === nextWeekStartIso() ? " (nächste Woche)" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-slate-500">
        Hier trägst du typischerweise freitags die Schichten für die kommende Woche ein. Nicht
        zugeteilte Mitarbeiter sehen &quot;noch nicht bekannt&quot;.
      </p>

      {employeesLoading ? (
        <p className="text-sm text-slate-500">Lade…</p>
      ) : (
        <WeekAssignmentsEditor
          key={weekStartIso}
          weekStartIso={weekStartIso}
          employees={activeEmployees}
        />
      )}
    </div>
  );
}

function WeekAssignmentsEditor({
  weekStartIso,
  employees,
}: {
  weekStartIso: string;
  employees: EmployeeWithProfile[];
}) {
  const { data: assignments, isLoading } = useWeekAssignments(weekStartIso);
  const save = useSaveWeekAssignments();

  const [overrides, setOverrides] = useState<Record<string, ShiftOrEmpty>>({});
  const [savedMessage, setSavedMessage] = useState(false);

  function valueFor(employeeId: string): ShiftOrEmpty {
    if (employeeId in overrides) return overrides[employeeId];
    return assignments?.byEmployeeId[employeeId] ?? NO_SHIFT;
  }

  function handleChange(employeeId: string, value: ShiftOrEmpty) {
    setOverrides((prev) => ({ ...prev, [employeeId]: value }));
    setSavedMessage(false);
  }

  async function handleSave() {
    if (!assignments) return;
    const changes: Record<string, Shift | null> = {};
    for (const [employeeId, value] of Object.entries(overrides)) {
      const previous = assignments.byEmployeeId[employeeId] ?? null;
      const next = value === NO_SHIFT ? null : value;
      if (previous !== next) changes[employeeId] = next;
    }
    if (Object.keys(changes).length > 0) {
      await save.mutateAsync({ weekStartIso, changes });
    }
    setOverrides({});
    setSavedMessage(true);
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Lade…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Mitarbeiter</th>
              <th className="px-4 py-2">Schicht</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium">{emp.profile.full_name}</td>
                <td className="px-4 py-2">
                  <select
                    value={valueFor(emp.id)}
                    onChange={(e) => handleChange(emp.id, e.target.value as ShiftOrEmpty)}
                    className="input w-auto"
                  >
                    <option value={NO_SHIFT}>— keine —</option>
                    {SHIFT_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {SHIFT_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-slate-400">
                  Keine aktiven Mitarbeiter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={save.isPending}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {save.isPending ? "Speichert…" : "Wochenplan speichern"}
        </button>
        {savedMessage && <span className="text-sm text-emerald-600">Gespeichert.</span>}
      </div>
    </div>
  );
}
