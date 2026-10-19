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
      className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3 focus-within:border-accent/40 transition-default"
    >
      <Plus weight="regular" className="w-4 h-4 text-muted shrink-0" />
      <input
        type="text"
        name="title"
        placeholder="Quick add an idea..."
        required
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted/50 outline-none"
      />
      <button
        type="submit"
        className="px-3 py-1.5 rounded-lg bg-surface-hover text-xs font-medium text-muted hover:text-foreground hover:bg-surface-active transition-default active:scale-[0.98]"
      >
        Add
      </button>
    </form>
  );
}
