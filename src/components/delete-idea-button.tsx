"use client";

import { useRouter } from "next/navigation";
import { deleteIdea } from "@/app/actions";
import { Trash } from "@phosphor-icons/react";

export function DeleteIdeaButton({ ideaId }: { ideaId: string }) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this idea and all its tasks? This cannot be undone."
    );
    if (!confirmed) return;
    await deleteIdea(ideaId);
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-[-0.01em] text-muted-subtle hover:text-rose-400 hover:bg-rose-950/30 hover:border-rose-500/25 border border-transparent transition-default active:scale-[0.98]"
    >
      <Trash weight="regular" className="w-3.5 h-3.5" />
      Delete
    </button>
  );
}
