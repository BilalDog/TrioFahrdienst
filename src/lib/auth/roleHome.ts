import type { AppRole } from "@/lib/supabase/types";

export function roleHomePath(role: AppRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "driver":
      return "/driver";
    case "employee":
      return "/employee";
  }
}
