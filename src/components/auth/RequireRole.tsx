"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { roleHomePath } from "@/lib/auth/roleHome";
import type { AppRole } from "@/lib/supabase/types";

export function RequireRole({
  allow,
  children,
}: {
  allow: AppRole[];
  children: React.ReactNode;
}) {
  const { session, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (!profile) {
      router.replace("/complete-profile");
      return;
    }
    if (!allow.includes(profile.role)) {
      router.replace(roleHomePath(profile.role));
    }
  }, [loading, session, profile, allow, router]);

  if (loading) {
    return <CenteredMessage text="Lade…" />;
  }
  if (!session) {
    return <CenteredMessage text="Weiterleitung zum Login…" />;
  }
  if (!profile) {
    return <CenteredMessage text="Weiterleitung…" />;
  }
  if (!allow.includes(profile.role)) {
    return <CenteredMessage text="Weiterleitung…" />;
  }
  if (!profile.is_active) {
    return (
      <CenteredMessage text="Dein Konto ist noch nicht freigeschaltet. Bitte wende dich an einen Admin." />
    );
  }

  return <>{children}</>;
}

function CenteredMessage({ text }: { text: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}
