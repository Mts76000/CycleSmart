import Link from "next/link";

/**
 * Shared secondary navigation link ("Gérer les programmes", "Modifier les
 * heures creuses"...). Previously every page hand-rolled a slightly
 * different variant (dashed border here, solid emerald-50 there) for the
 * exact same interaction, which read as inconsistent. One style, reused
 * everywhere the same kind of action appears.
 */
export function ActionLink({
  href,
  children,
  block = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  block?: boolean;
  className?: string;
}) {
  return (
    <Link
      className={`rounded-[var(--radius-sm)] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-[0.98] ${
        block ? "block text-center" : "inline-flex items-center justify-center"
      } ${className}`}
      href={href}
    >
      {children}
    </Link>
  );
}
