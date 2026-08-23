/**
 * Shared pill toggle used for the app's binary/ternary mode switches
 * (calculation mode, delay mode...). Previously each page hand-rolled its
 * own near-identical version with slightly different classes.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  columns,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  columns?: number;
}) {
  return (
    <div
      className="surface-sub grid gap-1 p-1"
      style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          className={`rounded-[14px] px-3 py-2.5 text-sm font-bold leading-snug transition ${
            value === option.value
              ? "bg-emerald-500 text-white shadow-cta"
              : "text-stone-500 hover:text-stone-700"
          }`}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
