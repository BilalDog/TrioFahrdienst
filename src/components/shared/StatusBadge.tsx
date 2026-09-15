export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive
          ? "bg-emerald-100 text-emerald-800"
          : "bg-gray-200 text-gray-600"
      }`}
    >
      {isActive ? "Aktiv" : "Inaktiv"}
    </span>
  );
}
