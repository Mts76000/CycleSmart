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
      className={`inline-flex h-10 items-center justify-center rounded-full border border-emerald-200 bg-white px-4 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 active:scale-[0.98] ${
        block ? "w-full text-center" : ""
      } ${className}`}
      href={href}
    >
      {children}
    </Link>
  );
}
