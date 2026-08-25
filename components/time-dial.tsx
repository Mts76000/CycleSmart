function formatWait(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) {
    return `${rest} min`;
  }

  if (rest === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${rest.toString().padStart(2, "0")}`;
}

const sizeConfig = {
  sm: { box: "size-16", viewBox: 96, radius: 40, stroke: 7, valueClass: "text-base", labelClass: "text-[8px]" },
  md: { box: "size-32 sm:size-36 md:size-40", viewBox: 120, radius: 52, stroke: 9, valueClass: "text-xl sm:text-2xl md:text-3xl", labelClass: "text-[9px] sm:text-[10px] md:text-xs" },
  lg: { box: "size-40 md:size-52 lg:size-60", viewBox: 140, radius: 60, stroke: 10, valueClass: "text-3xl md:text-4xl lg:text-5xl", labelClass: "text-[10px] md:text-xs" },
} as const;

/**
 * Signature dial used to visualise a wait/duration as progress around a
 * ring, rather than as plain text. Reused at several scales (hero, mini
 * program picker, profile) so the app has one recognisable "instrument"
 * instead of a one-off widget.
 */
export function TimeDial({
  minutes,
  label,
  size = "md",
  referenceMax = 480,
  tone = "light",
}: {
  minutes: number | null;
  label: string;
  size?: keyof typeof sizeConfig;
  referenceMax?: number;
  tone?: "light" | "dark";
}) {
  const config = sizeConfig[size];
  const progress = minutes === null ? 0 : Math.min(1, Math.max(0, minutes) / referenceMax);
  const circumference = 2 * Math.PI * config.radius;
  const offset = circumference * (1 - progress);
  const center = config.viewBox / 2;
  const valueText = minutes !== null ? formatWait(minutes) : "Non disponible";

  return (
    <div
      className={`relative grid shrink-0 place-items-center ${config.box}`}
      role="img"
      aria-label={`${label}: ${valueText}`}
    >
      <svg className="size-full -rotate-90" viewBox={`0 0 ${config.viewBox} ${config.viewBox}`} aria-hidden="true">
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          strokeWidth={config.stroke}
          fill="none"
          className={tone === "light" ? "stroke-white/15" : "stroke-emerald-800/10"}
        />
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          strokeWidth={config.stroke}
          fill="none"
          strokeLinecap="round"
          className={`transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            tone === "light" ? "stroke-white" : "stroke-emerald-600"
          }`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center px-2 text-center">
        <div>
          <p
            className={`font-display font-numeric font-black leading-none ${config.valueClass} ${
              tone === "light" ? "text-white" : "text-emerald-950"
            }`}
          >
            {minutes !== null ? formatWait(minutes) : "--"}
          </p>
          <p
            className={`mt-1.5 font-bold uppercase leading-tight tracking-wide ${config.labelClass} ${
              tone === "light" ? "text-emerald-50" : "text-emerald-700"
            }`}
          >
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}
