import { RequireRole } from "@/components/auth/RequireRole";
import { AppShell } from "@/components/shared/AppShell";

const navLinks = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/drivers", label: "Fahrer" },
  { href: "/admin/employees", label: "Mitarbeiter" },
  { href: "/admin/schedule", label: "Wochenplan" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={["admin"]}>
      <AppShell navLinks={navLinks}>{children}</AppShell>
    </RequireRole>
  );
}
