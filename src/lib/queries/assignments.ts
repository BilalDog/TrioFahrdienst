import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Shift } from "@/lib/supabase/types";
import { queryKeys } from "./keys";

export interface WeekAssignmentsResult {
  byEmployeeId: Record<string, Shift>;
}

export function useWeekAssignments(weekStartIso: string) {
  return useQuery({
    queryKey: [...queryKeys.assignments, weekStartIso],
    queryFn: async (): Promise<WeekAssignmentsResult> => {
      const { data, error } = await supabase
        .from("employee_shift_assignments")
        .select("employee_id, shift")
        .eq("week_start", weekStartIso);
      if (error) throw error;
      const byEmployeeId: Record<string, Shift> = {};
      for (const row of data ?? []) {
        byEmployeeId[row.employee_id] = row.shift;
      }
      return { byEmployeeId };
    },
  });
}

/** Alle Wochen, die ein Mitarbeiter selbst kennt (für die eigene Ansicht). */
export function useMyAssignments() {
  return useQuery({
    queryKey: [...queryKeys.assignments, "mine"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_shift_assignments")
        .select("employee_id, week_start, shift")
        .order("week_start");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export interface SaveWeekAssignmentsInput {
  weekStartIso: string;
  /** employeeId -> Schicht, oder null um die Zuteilung dieser Woche zu entfernen. */
  changes: Record<string, Shift | null>;
}

export function useSaveWeekAssignments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ weekStartIso, changes }: SaveWeekAssignmentsInput) => {
      const toUpsert = Object.entries(changes)
        .filter(([, shift]) => shift !== null)
        .map(([employee_id, shift]) => ({
          employee_id,
          week_start: weekStartIso,
          shift: shift as Shift,
        }));
      const toClear = Object.entries(changes)
        .filter(([, shift]) => shift === null)
        .map(([employee_id]) => employee_id);

      if (toUpsert.length > 0) {
        const { error } = await supabase
          .from("employee_shift_assignments")
          .upsert(toUpsert, { onConflict: "employee_id,week_start" });
        if (error) throw error;
      }
      if (toClear.length > 0) {
        const { error } = await supabase
          .from("employee_shift_assignments")
          .delete()
          .eq("week_start", weekStartIso)
          .in("employee_id", toClear);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments });
    },
  });
}
