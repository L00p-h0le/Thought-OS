"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteIdea } from "@/app/actions";
import { Trash, Warning } from "@phosphor-icons/react";
import { useToast } from "@/components/toast-provider";
import { Modal } from "@/components/modal";

export function DeleteIdeaButton({ ideaId }: { ideaId: string }) {
  const router = useRouter();
  const { info, error } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        className="btn btn-ghost-danger btn-sm"
      >
        <Trash weight="bold" className="w-4 h-4" aria-hidden />
        <span>Delete</span>
      </button>

      <Modal
        open={showConfirm}
        onClose={() => !isDeleting && setShowConfirm(false)}
        title="Delete this idea?"
        subtitle="This can't be undone."
        icon={
          <span className="icon-badge tone-danger">
            <Warning weight="fill" className="w-5 h-5" aria-hidden />
          </span>
        }
      >
        <p className="text-sm text-fg-body mb-6">
          This permanently deletes the idea, its analysis, and all of its tasks.
        </p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            className="btn btn-secondary"
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="btn btn-danger"
          >
            <Trash weight="bold" className="w-4 h-4" aria-hidden />
            {isDeleting ? "Deleting..." : "Delete permanently"}
          </button>
        </div>
      </Modal>
    </>
  );
}
