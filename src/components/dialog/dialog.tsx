"use client";

import { type ReactNode, useId, useRef } from "react";

interface DialogProps {
  title: string;
  trigger: ReactNode;
  triggerLabel?: string;
  triggerClassName: string;
  closeIcon?: ReactNode;
  onOpen?: () => void;
  children: ReactNode;
}

export function Dialog({
  title,
  trigger,
  triggerLabel,
  triggerClassName,
  closeIcon,
  onOpen,
  children,
}: DialogProps): ReactNode {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        ref={opener}
        type="button"
        aria-haspopup="dialog"
        aria-label={triggerLabel}
        onClick={() => {
          onOpen?.();
          dialog.current?.showModal();
        }}
        className={triggerClassName}
      >
        {trigger}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        aria-modal="true"
        onClose={() => opener.current?.focus()}
        className="m-auto max-h-[calc(100%-2rem)] w-[calc(100%-2*var(--spacing-gutter))] max-w-115 overflow-y-auto rounded-card bg-card p-5 text-foreground shadow-dialog backdrop:bg-scrim md:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="pt-2 text-h2 font-bold">
            {title}
          </h2>
          {closeIcon && (
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialog.current?.close()}
              className="grid size-11 shrink-0 place-items-center rounded-icon-button bg-soft text-foreground transition-colors hover:bg-track"
            >
              {closeIcon}
            </button>
          )}
        </div>
        <div className="mt-5">{children}</div>
      </dialog>
    </>
  );
}
