import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "./keys";

export function useSetProfileActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      profileId,
      isActive,
    }: {
      profileId: string;
      isActive: boolean;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: isActive })
        .eq("id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });
}

/** Entfernen = Profil löschen; ON DELETE CASCADE räumt drivers/employees mit auf. */
export function useDeleteProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments });
    },
  });
}
