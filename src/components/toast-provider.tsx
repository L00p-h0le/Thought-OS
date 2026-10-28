"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Link from "next/link";
import { CheckCircle, Warning, Info, X } from "@phosphor-icons/react";

export interface ToastAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, "id">) => void;
  success: (title: string, description?: string, action?: ToastAction) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      type,
      title,
      description,
      action,
      duration = 4000,
    }: Omit<ToastItem, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newItem: ToastItem = { id, type, title, description, action, duration };

      setToasts((prev) => [...prev.slice(-4), newItem]); // Keep at most 5

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, description?: string, action?: ToastAction) => {
      toast({ type: "success", title, description, action });
    },
    [toast]
  );

  const error = useCallback(
    (title: string, description?: string) => {
      toast({ type: "error", title, description });
    },
    [toast]
  );

  const info = useCallback(
    (title: string, description?: string, action?: ToastAction) => {
      toast({ type: "info", title, description, action });
    },
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      {/* Toast container: full-width bottom on phones, bottom-right otherwise */}
      <div
        aria-live="polite"
        className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 flex flex-col gap-2 sm:w-96 pointer-events-none"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          const tone = isSuccess ? "tone-success" : isError ? "tone-danger" : "tone-info";

          return (
            <div
              key={t.id}
              role={isError ? "alert" : "status"}
              className="pointer-events-auto tile shadow-(--shadow-lg) p-3.5 flex items-start gap-3 animate-in"
            >
              <span className={`icon-badge ${tone} w-8 h-8 rounded-lg`}>
                {isSuccess && <CheckCircle weight="fill" className="w-4 h-4" aria-hidden />}
                {isError && <Warning weight="fill" className="w-4 h-4" aria-hidden />}
                {!isSuccess && !isError && (
                  <Info weight="fill" className="w-4 h-4" aria-hidden />
                )}
              </span>

              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-fg leading-snug">{t.title}</p>
                {t.description && (
                  <p className="text-[0.8125rem] text-fg-muted mt-0.5 leading-snug break-words">
                    {t.description}
                  </p>
                )}
                {t.action && (
                  <div className="mt-2">
                    {t.action.href ? (
                      <Link
                        href={t.action.href}
                        onClick={() => removeToast(t.id)}
                        className="text-[0.8125rem] font-semibold text-accent hover:text-accent-hover underline underline-offset-4"
                      >
                        {t.action.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          t.action?.onClick?.();
                          removeToast(t.id);
                        }}
                        className="text-[0.8125rem] font-semibold text-accent hover:text-accent-hover cursor-pointer"
                      >
                        {t.action.label}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="btn btn-ghost btn-icon shrink-0 -mr-1 -mt-0.5"
                aria-label="Dismiss notification"
              >
                <X weight="bold" className="w-3.5 h-3.5" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
