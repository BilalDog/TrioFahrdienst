"use client";

import { useDrivers } from "@/lib/queries/drivers";
import { useEmployees } from "@/lib/queries/employees";
import { useWeekAssignments } from "@/lib/queries/assignments";
import { ShiftBadge } from "@/components/shared/ShiftBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { currentWeekStartIso, nextWeekStartIso, formatWeekLabel } from "@/lib/week";
import type { Shift } from "@/lib/supabase/types";

export default function DriverOverviewPage() {
  const { data: drivers, isLoading: driversLoading } = useDrivers();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const thisWeek = currentWeekStartIso();
  const nextWeek = nextWeekStartIso();
  const { data: thisWeekAssignments } = useWeekAssignments(thisWeek);
  const { data: nextWeekAssignments } = useWeekAssignments(nextWeek);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-lg font-semibold">Alle Fahrer</h1>
        {driversLoading ? (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <WeekRosterSection
        title={`Wochenplan – ${formatWeekLabel(thisWeek)} (diese Woche)`}
        employees={employees}
        loading={employeesLoading}
        assignmentByEmployeeId={thisWeekAssignments?.byEmployeeId}
      />
      <WeekRosterSection
        title={`Wochenplan – ${formatWeekLabel(nextWeek)} (nächste Woche)`}
        employees={employees}
        loading={employeesLoading}
        assignmentByEmployeeId={nextWeekAssignments?.byEmployeeId}
      />
    </div>
  );
}

function WeekRosterSection({
  title,
  employees,
  loading,
  assignmentByEmployeeId,
}: {
  title: string;
  employees: ReturnType<typeof useEmployees>["data"];
  loading: boolean;
  assignmentByEmployeeId: Record<string, string> | undefined;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {loading ? (
        <p className="text-sm text-slate-500">Lade…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Mitarbeiter</th>
                <th className="px-4 py-2">Schicht</th>
              </tr>
            </thead>
            <tbody>
              {employees
                ?.filter((e) => e.profile.is_active)
                .map((emp) => {
                  const shift = assignmentByEmployeeId?.[emp.id];
                  return (
                    <tr key={emp.id} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-medium">{emp.profile.full_name}</td>
                      <td className="px-4 py-2">
                        {shift ? (
                          <ShiftBadge shift={shift as Shift} />
                        ) : (
                          <span className="text-slate-400">noch nicht bekannt</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
