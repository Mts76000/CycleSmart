import { dayMinutes, timeToMinutes, type Slot } from "@/lib/cycle-store";

const hourMarks = [0, 3, 6, 9, 12, 15, 18, 21, 24];

function pct(minutes: number) {
  return (minutes / dayMinutes) * 100;
}

/**
 * 24h timeline, the app's other signature data visualisation alongside the
 * TimeDial. Segments can be linked to an external list (creneaux page) via
 * `highlightId` + `onHoverSegment` so a slot card and its position on the
 * timeline read as the same object, not two disconnected UIs.
 */
export function SlotsTimeline({
  slots,
  currentTime,
  highlightId = null,
  onHoverSegment,
  compact = false,
}: {
  slots: Slot[];
  currentTime: string;
  highlightId?: string | null;
  onHoverSegment?: (slotId: string | null) => void;
  compact?: boolean;
}) {
  const nowMinutes = timeToMinutes(currentTime);
  const nowPct = pct(nowMinutes);

  const segments = slots.flatMap((slot) => {
    const start = timeToMinutes(slot.start);
    const rawEnd = timeToMinutes(slot.end);

    if (rawEnd > start) {
      return [{ id: slot.id, slotId: slot.id, left: start, width: rawEnd - start, name: slot.name }];
    }

    return [
      { id: `${slot.id}-a`, slotId: slot.id, left: start, width: dayMinutes - start, name: slot.name },
      { id: `${slot.id}-b`, slotId: slot.id, left: 0, width: rawEnd, name: slot.name },
    ];
  });

  const isInSlot = segments.some(
    (segment) => nowMinutes >= segment.left && nowMinutes <= segment.left + segment.width,
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-50">Journée (24h)</p>
        <p
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            isInSlot ? "bg-white text-emerald-800" : "bg-emerald-800 text-emerald-50"
          }`}
        >
          {isInSlot ? "Heure creuse en cours" : "Heure pleine en cours"}
        </p>
      </div>

      <div className={`relative mt-4 ${compact ? "h-6" : "h-8"}`}>
        {hourMarks.map((hour) => (
          <span
            key={hour}
            className="absolute top-0 h-3 w-px bg-white/15"
            style={{ left: `${pct(hour * 60)}%` }}
            aria-hidden="true"
          />
        ))}

        <div className={`absolute top-0 w-full overflow-hidden rounded-full bg-emerald-800 ${compact ? "h-2.5" : "h-3"}`}>
          {segments.map((segment) => {
            const isHighlighted = highlightId !== null && highlightId === segment.slotId;

            return (
              <span
                key={segment.id}
                className={`absolute inset-y-0 cursor-default transition-[opacity,filter] ${
                  isHighlighted ? "bg-emerald-200" : "bg-white"
                } ${highlightId !== null && !isHighlighted ? "opacity-40" : "opacity-100"}`}
                style={{
                  left: `${pct(segment.left)}%`,
                  width: `${Math.max(pct(segment.width), 0.6)}%`,
                }}
                title={segment.name}
                onMouseEnter={() => onHoverSegment?.(segment.slotId)}
                onMouseLeave={() => onHoverSegment?.(null)}
              />
            );
          })}
        </div>

        <div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${nowPct}%` }}
        >
          <span className="size-3 rounded-full bg-emerald-300 ring-4 ring-emerald-300/30" aria-hidden="true" />
          <span className="mt-1 whitespace-nowrap rounded-full bg-emerald-900 px-1.5 py-0.5 text-[9px] font-bold text-white font-numeric">
            {currentTime}
          </span>
        </div>
      </div>

      {!compact && (
        <div className="relative mt-3 h-4 text-[10px] font-bold text-emerald-50">
          {hourMarks.map((hour, index) => {
            const isFirst = index === 0;
            const isLast = index === hourMarks.length - 1;

            return (
              <span
                key={hour}
                className={`absolute top-0 font-numeric ${
                  isFirst ? "" : isLast ? "-translate-x-full" : "-translate-x-1/2"
                }`}
                style={{ left: `${pct(hour * 60)}%` }}
              >
                {hour}h
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
