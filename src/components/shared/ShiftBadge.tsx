import type { Shift } from "@/lib/supabase/types";
import { SHIFT_LABELS } from "@/lib/supabase/types";

const SHIFT_STYLES: Record<Shift, string> = {
  fruh: "bg-amber-100 text-amber-800",
  spat: "bg-sky-100 text-sky-800",
  nacht: "bg-indigo-100 text-indigo-800",
};

export function ShiftBadge({ shift }: { shift: Shift }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${SHIFT_STYLES[shift]}`}
    >
      {SHIFT_LABELS[shift]}
    </span>
  );
}
