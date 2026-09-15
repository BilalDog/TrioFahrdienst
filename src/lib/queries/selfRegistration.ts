import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Shift } from "@/lib/supabase/types";

export interface CompleteProfileInput {
  role: "driver" | "employee";
  full_name: string;
  phone: string;
  shift?: Shift;
  vehicle_info?: string;
}

/** Legt für den bereits angemeldeten, aber noch profillosen Nutzer selbst
 * eine profiles-Zeile (immer is_active=false) plus passende drivers-/
 * employees-Zeile an. Setzt eine Selbstregistrierung fort, die mit
 * supabase.auth.signUp() begonnen hat. */
export function useCompleteProfile() {
  return useMutation({
    mutationFn: async (input: CompleteProfileInput) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Nicht angemeldet.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          auth_user_id: session.user.id,
          role: input.role,
          full_name: input.full_name,
          email: session.user.email ?? "",
          phone: input.phone || null,
          is_active: false,
        })
        .select()
        .single();
      if (profileError) throw profileError;

      if (input.role === "driver") {
        const { error } = await supabase.from("drivers").insert({
          profile_id: profile.id,
          shift: input.shift ?? "fruh",
          vehicle_info: input.vehicle_info || null,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employees").insert({
          profile_id: profile.id,
        });
        if (error) throw error;
      }

      return profile;
    },
  });
}
