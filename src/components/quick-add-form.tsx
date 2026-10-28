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
      className="flex items-center gap-2"
    >
      <label htmlFor="quick-capture" className="sr-only">
        Idea title
      </label>
      <div className="relative flex-1">
        <Plus
          weight="bold"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none"
          aria-hidden
        />
        <input
          id="quick-capture"
          ref={inputRef}
          type="text"
          name="title"
          placeholder="What's the idea? Press Enter to save"
          required
          disabled={submitting}
          maxLength={200}
          className="field pl-9 disabled:opacity-60"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary shrink-0"
      >
        {submitting ? (
          <>
            <SpinnerGap weight="bold" className="w-4 h-4 animate-spin" aria-hidden />
            <span>Capturing...</span>
          </>
        ) : (
          <span>Capture</span>
        )}
      </button>
    </form>
  );
}
