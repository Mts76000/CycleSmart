"use client";

import { useRef } from "react";
import { ChevronRightIcon, CloseIcon } from "@/components/icons";

export function SettingsModalRow({
  icon,
  label,
  description,
  title,
  modalDescription,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  title: string;
  modalDescription?: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-stone-50"
        onClick={() => dialogRef.current?.showModal()}
        type="button"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-stone-950">{label}</span>
          <span className="block truncate text-xs text-stone-600">{description}</span>
        </span>
        <ChevronRightIcon className="size-4 shrink-0 text-stone-300" />
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-md rounded-[var(--radius-lg)] bg-white p-0 shadow-2xl backdrop:bg-stone-950/50 backdrop:backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            dialogRef.current?.close();
          }
        }}
      >
        <div className="max-h-[85vh] overflow-y-auto p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xl font-bold text-stone-950">{title}</p>
              {modalDescription && <p className="mt-1 text-sm text-stone-600">{modalDescription}</p>}
            </div>
            <button
              aria-label="Fermer"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200 active:scale-95"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              <CloseIcon className="size-4" />
            </button>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      </dialog>
    </>
  );
}
