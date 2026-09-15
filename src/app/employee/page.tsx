"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { useDrivers } from "@/lib/queries/drivers";
import { useMyAssignments } from "@/lib/queries/assignments";
import { ShiftBadge } from "@/components/shared/ShiftBadge";
import { currentWeekStartIso, nextWeekStartIso, formatWeekLabel } from "@/lib/week";
import type { Shift } from "@/lib/supabase/types";

export default function EmployeeMyDriverPage() {
  const { profile } = useAuth();
  const { data: assignments, isLoading: assignmentsLoading } = useMyAssignments();
  const { data: drivers, isLoading: driversLoading } = useDrivers();

  const thisWeek = currentWeekStartIso();
  const nextWeek = nextWeekStartIso();

  const shiftForWeek = (weekIso: string): Shift | undefined =>
    assignments?.find((a) => a.week_start === weekIso)?.shift;

  const loading = assignmentsLoading || driversLoading;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">
        Hallo{profile ? `, ${profile.full_name}` : ""}
      </h1>

      {loading ? (
        <p className="text-sm text-slate-500">Lade…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <WeekDriverCard
            title="Diese Woche"
            weekLabel={formatWeekLabel(thisWeek)}
            shift={shiftForWeek(thisWeek)}
            drivers={drivers}
          />
          <WeekDriverCard
            title="Nächste Woche"
            weekLabel={formatWeekLabel(nextWeek)}
            shift={shiftForWeek(nextWeek)}
            drivers={drivers}
          />
        </div>
      )}
    </div>
  );
}

function WeekDriverCard({
  title,
  weekLabel,
  shift,
  drivers,
}: {
  title: string;
  weekLabel: string;
  shift: Shift | undefined;
  drivers: ReturnType<typeof useDrivers>["data"];
}) {
  const matchingDrivers = shift ? drivers?.filter((d) => d.shift === shift) ?? [] : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">
        {title} · {weekLabel}
      </p>
      {!shift ? (
        <p className="mt-3 text-sm text-slate-400">
          Deine Schicht ist noch nicht bekannt. Der Admin trägt sie üblicherweise freitags für die
          kommende Woche ein.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <ShiftBadge shift={shift} />
          {matchingDrivers.length === 0 && (
            <p className="text-sm text-slate-400">
              Für diese Schicht ist aktuell kein aktiver Fahrer hinterlegt.
            </p>
          )}
          {matchingDrivers.map((driver) => (
            <div key={driver.id} className="rounded-lg bg-slate-50 p-3">
              <p className="font-medium">{driver.profile.full_name}</p>
              {!driver.profile.is_active && (
                <p className="text-xs text-amber-600">Dieser Fahrer ist aktuell inaktiv.</p>
              )}
              <p className="text-sm text-slate-600">{driver.profile.email}</p>
              {driver.profile.phone && (
                <p className="text-sm text-slate-600">{driver.profile.phone}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
