import type { ReactNode } from "react";
export function Field({
  label,
  hint,
  children,
  required = false,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="font-medium">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </span>
      {hint && (
        <span className="block text-xs leading-5 text-muted">{hint}</span>
      )}
      {children}
    </label>
  );
}
export const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/85 disabled:opacity-50";
export const secondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium transition hover:border-mint hover:text-mint";
