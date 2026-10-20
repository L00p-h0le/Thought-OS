"use client";

import { useRef, useState } from "react";
import { createIdea } from "@/app/actions";
import { Plus, SpinnerGap } from "@phosphor-icons/react";
import { useToast } from "@/components/toast-provider";

export function QuickAddForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToast();

  async function handleSubmit(formData: FormData) {
    if (submitting) return;

    const title = (formData.get("title") as string)?.trim();
    if (!title) {
      error("Title is required", "Please enter a concept or title for your idea.");
      return;
    }

    if (title.length > 200) {
      error("Title too long", "Maximum title length is 200 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const idea = await createIdea(formData);
      formRef.current?.reset();
      success(
        "Idea captured!",
        `Draft "${idea.title}" saved.`,
        { label: "Open idea →", href: `/ideas/${idea.id}` }
      );
      inputRef.current?.focus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to capture idea";
      error("Capture failed", msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex items-center gap-3 bg-gradient-to-r from-[#141926]/90 to-[#10141f]/90 border border-white/12 rounded-2xl p-3 focus-within:border-emerald-500/50 focus-within:shadow-[0_0_24px_-2px_rgba(16,185,129,0.28)] transition-default backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0 ml-0.5">
        <Plus weight="bold" className="w-4 h-4 text-emerald-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        name="title"
        placeholder="Quick capture an idea (press Enter to create)..."
        required
        disabled={submitting}
        maxLength={200}
        className="flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 tracking-tight outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-400 text-xs font-bold text-emerald-300 hover:text-emerald-950 transition-default active:scale-[0.97] shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
      >
        {submitting ? (
          <>
            <SpinnerGap weight="bold" className="w-3.5 h-3.5 animate-spin" />
            <span>Capturing...</span>
          </>
        ) : (
          <span>Capture</span>
        )}
      </button>
    </form>
  );
}
