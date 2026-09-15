import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useInvitePerson() {
  return useMutation({
    mutationFn: async (profileId: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Nicht angemeldet.");

      const res = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ profileId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Einladen fehlgeschlagen.");
      return json;
    },
  });
}
