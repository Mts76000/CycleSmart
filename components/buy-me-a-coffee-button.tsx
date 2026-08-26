/** Renders nothing when NEXT_PUBLIC_BUYMEACOFFEE_SLUG isn't set — opt-in per project. */
export function BuyMeACoffeeButton() {
  const slug = process.env.NEXT_PUBLIC_BUYMEACOFFEE_SLUG;
  if (!slug) return null;

  return (
    <a
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 text-sm font-bold text-white transition hover:bg-emerald-800 active:scale-[0.98] sm:w-auto"
      href={`https://www.buymeacoffee.com/${slug}`}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span aria-hidden="true">☕</span>
      Soutenir CycleSmart
    </a>
  );
}
