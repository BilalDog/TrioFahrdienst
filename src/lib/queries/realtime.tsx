"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { queryKeys } from "./keys";

/**
 * Abonniert Postgres-Changes auf den vier fachlichen Tabellen und invalidiert
 * die passenden React-Query-Caches, damit alle offenen Tabs/Geräte
 * automatisch aktualisieren, sobald jemand etwas ändert.
 */
export function RealtimeSync() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "drivers" },
        () => queryClient.invalidateQueries({ queryKey: queryKeys.drivers }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "employees" },
        () => queryClient.invalidateQueries({ queryKey: queryKeys.employees }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "employee_shift_assignments" },
        () =>
          queryClient.invalidateQueries({ queryKey: queryKeys.assignments }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.drivers });
          queryClient.invalidateQueries({ queryKey: queryKeys.employees });
        },
      )
      .subscribe();

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        queryClient.invalidateQueries();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      supabase.removeChannel(channel);
    };
  }, [session, queryClient]);

  return null;
}
