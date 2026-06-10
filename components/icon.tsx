export function Icon({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`grid size-10 place-items-center rounded-2xl text-lg ${
        active ? "bg-cyan-400 text-slate-950" : "bg-white/80 text-teal-700"
      }`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
