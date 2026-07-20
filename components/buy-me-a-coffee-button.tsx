export function BuyMeACoffeeButton() {
  return (
    <div className="mt-6 flex justify-center">
      <a
        className="flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-600 active:scale-[0.98]"
        href="https://www.buymeacoffee.com/mlamote"
        rel="noopener noreferrer"
        target="_blank"
      >
        <span aria-hidden="true">☕</span>
        Buy me a coffee
      </a>
    </div>
  );
}
