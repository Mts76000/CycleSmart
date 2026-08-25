type IconProps = {
  className?: string;
};

function SvgIcon({ children, className }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className={className || "size-5"}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </SvgIcon>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect height="18" rx="2" width="18" x="3" y="4" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </SvgIcon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </SvgIcon>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M20.5 14.5A8 8 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
    </SvgIcon>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </SvgIcon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M6 6l1 16h10l1-16" />
    </SvgIcon>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" />
    </SvgIcon>
  );
}

export function DeviceIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect height="18" rx="3" width="14" x="5" y="3" />
      <path d="M9 7h.01M15 7h.01" />
      <circle cx="12" cy="14" r="4" />
      <path d="M9.5 14a4 4 0 0 0 5 0" />
    </SvgIcon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </SvgIcon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect height="11" rx="2" width="16" x="4" y="11" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </SvgIcon>
  );
}

export function MoneyIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 9v.01M18 15v.01" />
    </SvgIcon>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </SvgIcon>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6" />
      <path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.1 4.1" />
      <path d="M6.6 6.6C3.6 8.5 2 12 2 12s3.5 7 10 7a10.5 10.5 0 0 0 4.2-.9" />
    </SvgIcon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 5v14M5 12h14" />
    </SvgIcon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </SvgIcon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m9 6 6 6-6 6" />
    </SvgIcon>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </SvgIcon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-5M12 8h.01" />
    </SvgIcon>
  );
}
