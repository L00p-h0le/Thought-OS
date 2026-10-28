"use client";

import { useEffect, useId, useRef } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
};

/**
 * Native <dialog> rendered in the top layer: the browser handles the focus
 * trap, Escape (via `cancel`), inert background and focus return on close.
 */
export function Modal({ open, onClose, title, children, icon, subtitle }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Clicks on the backdrop target the <dialog> element itself.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {open && (
        <>
          <div className="flex items-start gap-3 mb-4">
            {icon}
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-bold">
                {title}
              </h2>
              {subtitle && <p className="text-sm text-fg-muted">{subtitle}</p>}
            </div>
          </div>
          {children}
        </>
      )}
    </dialog>
  );
}
