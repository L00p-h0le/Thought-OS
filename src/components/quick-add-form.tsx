"use client";

import { useRef } from "react";
import { createIdea } from "@/app/actions";
import { Plus } from "@phosphor-icons/react";

export function QuickAddForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await createIdea(formData);
    formRef.current?.reset();
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
        type="text"
        name="title"
        placeholder="Quick capture an idea (press Enter to create)..."
        required
        className="flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-500 tracking-tight outline-none"
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-400 text-xs font-bold text-emerald-300 hover:text-emerald-950 transition-default active:scale-[0.97] shadow-sm cursor-pointer"
      >
        Capture
      </button>
    </form>
  );
}
