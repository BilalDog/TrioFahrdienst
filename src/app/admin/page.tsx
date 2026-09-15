"use client";

import Link from "next/link";
import { useDrivers } from "@/lib/queries/drivers";
import { useEmployees } from "@/lib/queries/employees";

export default function AdminDashboardPage() {
  const { data: drivers } = useDrivers();
  const { data: employees } = useEmployees();

  const activeDrivers = drivers?.filter((d) => d.profile.is_active).length ?? 0;
  const activeEmployees = employees?.filter((e) => e.profile.is_active).length ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Übersicht</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Aktive Fahrer" value={activeDrivers} href="/admin/drivers" />
        <StatCard label="Aktive Mitarbeiter" value={activeEmployees} href="/admin/employees" />
        <Link
          href="/admin/schedule"
          className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400"
        >
          <p className="text-sm text-slate-500">Wochenplan</p>
          <p className="mt-1 text-sm font-medium">Schichten für die kommende Woche eintragen →</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400"
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </Link>
  );
}
