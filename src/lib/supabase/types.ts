export type AppRole = "admin" | "driver" | "employee";
export type Shift = "fruh" | "spat" | "nacht";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_user_id: string | null;
          role: AppRole;
          full_name: string;
          email: string;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          role: AppRole;
          full_name: string;
          email: string;
          phone?: string | null;
          is_active?: boolean;
        };
        Update: Partial<{
          full_name: string;
          email: string;
          phone: string | null;
          is_active: boolean;
        }>;
        Relationships: [];
      };
      drivers: {
        Row: {
          id: string;
          profile_id: string;
          shift: Shift;
          vehicle_info: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          shift: Shift;
          vehicle_info?: string | null;
        };
        Update: Partial<{
          shift: Shift;
          vehicle_info: string | null;
        }>;
        Relationships: [];
      };
      employees: {
        Row: {
          id: string;
          profile_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      employee_shift_assignments: {
        Row: {
          id: string;
          employee_id: string;
          week_start: string;
          shift: Shift;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          week_start: string;
          shift: Shift;
        };
        Update: Partial<{
          shift: Shift;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Driver = Database["public"]["Tables"]["drivers"]["Row"];
export type Employee = Database["public"]["Tables"]["employees"]["Row"];
export type EmployeeShiftAssignment =
  Database["public"]["Tables"]["employee_shift_assignments"]["Row"];

export const SHIFT_LABELS: Record<Shift, string> = {
  fruh: "Früh",
  spat: "Spät",
  nacht: "Nacht",
};

export const SHIFT_ORDER: Shift[] = ["fruh", "spat", "nacht"];
