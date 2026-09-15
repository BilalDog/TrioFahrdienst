import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import { queryKeys } from "./keys";

export interface EmployeeWithProfile {
  id: string;
  profile_id: string;
  profile: Profile;
}

export function useEmployees() {
  return useQuery({
    queryKey: queryKeys.employees,
    queryFn: async (): Promise<EmployeeWithProfile[]> => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, profile_id, profile:profiles(*)")
        .order("id");
      if (error) throw error;
      const rows = (data ?? []) as unknown as EmployeeWithProfile[];
      return rows.sort((a, b) => a.profile.full_name.localeCompare(b.profile.full_name));
    },
  });
}

export interface CreateEmployeeInput {
  full_name: string;
  email: string;
  phone: string;
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateEmployeeInput) => {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          role: "employee",
          full_name: input.full_name,
          email: input.email,
          phone: input.phone || null,
        })
        .select()
        .single();
      if (profileError) throw profileError;

      const { error: employeeError } = await supabase
        .from("employees")
        .insert({ profile_id: profile.id });
      if (employeeError) throw employeeError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });
}

export interface UpdateEmployeeInput {
  profileId: string;
  full_name: string;
  email: string;
  phone: string;
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateEmployeeInput) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: input.full_name,
          email: input.email,
          phone: input.phone || null,
        })
        .eq("id", input.profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });
}
