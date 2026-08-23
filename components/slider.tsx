"use client";

/**
 * Custom slider: native <input type="range"> track/thumb rendering is
 * inconsistent across browsers (Firefox especially ignores background
 * gradients on the track), and its thumb position never lines up exactly
 * with a CSS-computed fill percentage because of the browser's internal
 * thumb-width inset. Here the native input stays for interaction,
 * keyboard access and accessibility, but is fully transparent; the visible
 * track/fill/thumb are separate elements positioned from the same
 * `percent` value, so they can never visually disagree.
 */
export function Slider({
  id,
  min,
  max,
  step,
  value,
  onChange,
}: {
  id?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative flex h-7 items-center">
      <div className="absolute inset-x-0 h-2 rounded-full bg-[var(--surface-2)]" aria-hidden="true" />
      <div
        className="absolute left-0 h-2 rounded-full bg-emerald-500"
        style={{ width: `${percent}%` }}
        aria-hidden="true"
      />
      <input
        id={id}
        className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div
        className="pointer-events-none absolute size-6 -translate-x-1/2 rounded-full border-[3px] border-emerald-500 bg-white shadow-[0_4px_10px_-2px_rgba(6,78,59,0.35)] transition-transform peer-focus-visible:ring-4 peer-focus-visible:ring-emerald-200"
        style={{ left: `${percent}%` }}
        aria-hidden="true"
      />
    </div>
  );
}
