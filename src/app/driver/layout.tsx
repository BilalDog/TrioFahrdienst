import { RequireRole } from "@/components/auth/RequireRole";
import { AppShell } from "@/components/shared/AppShell";

const navLinks = [{ href: "/driver", label: "Übersicht" }];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={["driver"]}>
      <AppShell navLinks={navLinks}>{children}</AppShell>
    </RequireRole>
  );
}
