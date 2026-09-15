import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Profile, Shift } from "@/lib/supabase/types";
import { queryKeys } from "./keys";

export interface DriverWithProfile {
  id: string;
  profile_id: string;
  shift: Shift;
  vehicle_info: string | null;
  profile: Profile;
}

export function useDrivers() {
  return useQuery({
    queryKey: queryKeys.drivers,
    queryFn: async (): Promise<DriverWithProfile[]> => {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, profile_id, shift, vehicle_info, profile:profiles(*)")
        .order("shift");
      if (error) throw error;
      return (data ?? []) as unknown as DriverWithProfile[];
    },
  });
}

export interface CreateDriverInput {
  full_name: string;
  email: string;
  phone: string;
  shift: Shift;
  vehicle_info: string;
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateDriverInput) => {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          role: "driver",
          full_name: input.full_name,
          email: input.email,
          phone: input.phone || null,
        })
        .select()
        .single();
      if (profileError) throw profileError;

      const { error: driverError } = await supabase.from("drivers").insert({
        profile_id: profile.id,
        shift: input.shift,
        vehicle_info: input.vehicle_info || null,
      });
      if (driverError) throw driverError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers });
    },
  });
}

export interface UpdateDriverInput {
  driverId: string;
  profileId: string;
  full_name: string;
  email: string;
  phone: string;
  shift: Shift;
  vehicle_info: string;
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateDriverInput) => {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: input.full_name,
          email: input.email,
          phone: input.phone || null,
        })
        .eq("id", input.profileId);
      if (profileError) throw profileError;

      const { error: driverError } = await supabase
        .from("drivers")
        .update({ shift: input.shift, vehicle_info: input.vehicle_info || null })
        .eq("id", input.driverId);
      if (driverError) throw driverError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers });
    },
  });
}

