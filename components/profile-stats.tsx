"use client";

import { CalendarIcon, ClockIcon, DeviceIcon } from "@/components/icons";
import { useCycle } from "@/lib/cycle-store";

export function ProfileStats() {
  const { machines, slots } = useCycle();
  const programsCount = machines.reduce((sum, machine) => sum + machine.programs.length, 0);

  const stats = [
    {
      icon: DeviceIcon,
      value: machines.length,
      label: machines.length > 1 ? "Machines" : "Machine",
    },
    {
      icon: ClockIcon,
      value: programsCount,
      label: programsCount > 1 ? "Programmes" : "Programme",
    },
    { icon: CalendarIcon, value: slots.length, label: slots.length > 1 ? "Creneaux" : "Creneau" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {stats.map(({ icon: Icon, value, label }) => (
        <div
          className="rounded-2xl bg-emerald-800 px-2 py-3 text-center sm:rounded-3xl sm:p-4"
          key={label}
        >
          <Icon className="mx-auto size-4 text-emerald-50 sm:size-5" />
          <p className="font-display mt-1.5 text-xl font-black text-white sm:mt-2 sm:text-2xl">
            {value}
          </p>
          <p className="mt-0.5 text-[10px] font-bold tracking-wide text-emerald-50 uppercase sm:text-xs">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
