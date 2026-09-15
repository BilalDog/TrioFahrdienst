import { RequireRole } from "@/components/auth/RequireRole";
import { AppShell } from "@/components/shared/AppShell";

const navLinks = [{ href: "/employee", label: "Mein Fahrer" }];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={["employee"]}>
      <AppShell navLinks={navLinks}>{children}</AppShell>
    </RequireRole>
  );
}
