"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { roleHomePath } from "@/lib/auth/roleHome";

export default function Home() {
  const { session, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (profile) {
      router.replace(roleHomePath(profile.role));
    } else {
      router.replace("/complete-profile");
    }
  }, [loading, session, profile, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
      Lade…
    </div>
  );
}
