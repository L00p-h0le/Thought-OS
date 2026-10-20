"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { deleteIdea } from "@/app/actions";
import { Trash, Warning, X } from "@phosphor-icons/react";
import { useToast } from "@/components/toast-provider";

export function DeleteIdeaButton({ ideaId }: { ideaId: string }) {
  const router = useRouter();
  const { info, error } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await deleteIdea(ideaId);
      info("Idea deleted", "Idea and its associated tasks have been permanently deleted.");
      setShowConfirm(false);
      router.push("/");
    } catch (err: unknown) {
      setIsDeleting(false);
      error("Failed to delete idea", err instanceof Error ? err.message : undefined);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 hover:border-rose-500/25 border border-transparent transition-default active:scale-[0.98] cursor-pointer"
        title="Delete idea"
      >
        <Trash weight="bold" className="w-3.5 h-3.5" />
        <span>Delete</span>
      </button>

      {/* Delete Confirmation Modal rendered via Portal to break out of CSS transform containers */}
      {mounted &&
        showConfirm &&
        createPortal(
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => !isDeleting && setShowConfirm(false)}
          >
            <div
              className="glass-card rounded-2xl p-6 max-w-md w-full border border-rose-500/30 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] relative animate-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => !isDeleting && setShowConfirm(false)}
                disabled={isDeleting}
                className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition-default cursor-pointer disabled:opacity-50"
                title="Cancel"
              >
                <X weight="bold" className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/35 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_16px_rgba(244,63,94,0.25)]">
                  <Warning weight="fill" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Delete this idea?
                  </h3>
                  <p className="text-xs text-rose-400/90 font-mono">
                    Destructive &middot; cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                This will permanently delete this idea, along with all of its feasibility evaluations and task tracker items.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-default cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 border border-rose-500 text-xs font-bold text-white transition-default active:scale-[0.98] cursor-pointer shadow-[0_0_16px_rgba(244,63,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Trash weight="bold" className="w-3.5 h-3.5" />
                  <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
