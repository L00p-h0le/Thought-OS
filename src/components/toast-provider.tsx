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
      {/* Toast floating container */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 transition-all duration-300 animate-in ${
                isSuccess
                  ? "bg-[#111923]/95 border-emerald-500/35 text-white shadow-[0_8px_32px_rgba(16,185,129,0.22)]"
                  : isError
                    ? "bg-[#1f141a]/95 border-rose-500/35 text-white shadow-[0_8px_32px_rgba(244,63,94,0.22)]"
                    : "bg-[#141826]/95 border-indigo-500/35 text-white shadow-[0_8px_32px_rgba(99,102,241,0.22)]"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                  isSuccess
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : isError
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                      : "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"
                }`}
              >
                {isSuccess && <CheckCircle weight="fill" className="w-4 h-4" />}
                {isError && <Warning weight="fill" className="w-4 h-4" />}
                {!isSuccess && !isError && (
                  <Info weight="fill" className="w-4 h-4" />
                )}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-xs font-bold tracking-tight text-white">
                  {t.title}
                </p>
                {t.description && (
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
                    {t.description}
                  </p>
                )}
                {t.action && (
                  <div className="mt-2">
                    {t.action.href ? (
                      <Link
                        href={t.action.href}
                        onClick={() => removeToast(t.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-default underline underline-offset-4 cursor-pointer"
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
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-default cursor-pointer"
                      >
                        {t.action.label}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Dismiss */}
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-default cursor-pointer shrink-0 -mr-1"
                title="Dismiss"
              >
                <X weight="bold" className="w-3.5 h-3.5" />
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
