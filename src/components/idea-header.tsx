"use client";

import { useState, useRef } from "react";
import { updateIdea, archiveIdea, restoreIdea, launchIdea } from "@/app/actions";
import { useToast } from "@/components/toast-provider";
import { Modal } from "@/components/modal";
import { StatusBadge } from "@/components/status-badge";
import {
  IDEA_STATUSES,
  STATUS_LABELS,
  STATUS_CSS,
  type IdeaStatus,
} from "@/lib/constants";
import {
  PencilSimple,
  Check,
  Tag,
  Rocket,
  ArrowCounterClockwise,
  CalendarBlank,
} from "@phosphor-icons/react";

type IdeaHeaderProps = {
  idea: {
    id: string;
    title: string;
    description: string;
    status: string;
    category: string | null;
    archivedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  actions?: React.ReactNode;
};

export function IdeaHeader({ idea, actions }: IdeaHeaderProps) {
  const { success, info, error } = useToast();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [title, setTitle] = useState(idea.title);
  const [description, setDescription] = useState(idea.description);
  const [category, setCategory] = useState(idea.category || "");
  const [status, setStatus] = useState(idea.status);
  const [showLaunchConfirm, setShowLaunchConfirm] = useState(false);
  const [titleError, setTitleError] = useState("");
  const categoryRef = useRef<HTMLInputElement>(null);

  async function saveTitle() {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError("Title is required");
      return;
    }
    if (trimmed.length > 200) {
      setTitleError("Title must be 200 characters or less");
      return;
    }
    setTitleError("");
    if (trimmed !== idea.title) {
      try {
        await updateIdea(idea.id, { title: trimmed });
        success("Title updated");
      } catch (err: unknown) {
        error("Failed to update title", err instanceof Error ? err.message : undefined);
      }
    }
    setIsEditingTitle(false);
  }

  async function saveDescription() {
    if (description !== idea.description) {
      try {
        await updateIdea(idea.id, { description });
        success("Description updated");
      } catch (err: unknown) {
        error("Failed to update description", err instanceof Error ? err.message : undefined);
      }
    }
  }

  async function saveCategory() {
    const trimmed = category.trim();
    const newCat = trimmed || null;
    if (newCat !== idea.category) {
      try {
        await updateIdea(idea.id, { category: newCat });
        success("Category updated");
      } catch (err: unknown) {
        error("Failed to update category", err instanceof Error ? err.message : undefined);
      }
    }
    setIsEditingCategory(false);
  }

  async function changeStatus(newStatus: string) {
    // Intercept LAUNCHED — require confirmation
    if (newStatus === "LAUNCHED") {
      setShowLaunchConfirm(true);
      return;
    }
    // ARCHIVED goes through archiveIdea action
    if (newStatus === "ARCHIVED") {
      setStatus(newStatus);
      try {
        await archiveIdea(idea.id);
        info("Idea archived", "You can find this idea under the Archived filter.");
      } catch (err: unknown) {
        error("Failed to archive idea", err instanceof Error ? err.message : undefined);
      }
      return;
    }
    setStatus(newStatus);
    try {
      await updateIdea(idea.id, { status: newStatus });
      success(`Status changed to ${STATUS_LABELS[newStatus as IdeaStatus] || newStatus}`);
    } catch (err: unknown) {
      error("Failed to update status", err instanceof Error ? err.message : undefined);
    }
  }

  async function confirmLaunch() {
    setStatus("LAUNCHED");
    setShowLaunchConfirm(false);
    try {
      await launchIdea(idea.id);
      success("Idea Launched! 🚀", `Congratulations on shipping "${idea.title}".`);
    } catch (err: unknown) {
      error("Failed to launch idea", err instanceof Error ? err.message : undefined);
    }
  }

  async function handleRestore() {
    setStatus("EXPLORING");
    try {
      await restoreIdea(idea.id);
      success("Idea restored", "Idea moved back to active status (Exploring).");
    } catch (err: unknown) {
      error("Failed to restore idea", err instanceof Error ? err.message : undefined);
    }
  }


  const isArchived = status === "ARCHIVED";

  const createdDate = new Date(idea.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <section className="tile p-5 md:p-6" aria-label="Idea details">
        {/* Status + Category + meta row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {isArchived ? (
            <>
              <StatusBadge status="ARCHIVED" />
              <button
                type="button"
                onClick={handleRestore}
                className="btn btn-secondary btn-sm"
              >
                <ArrowCounterClockwise weight="bold" className="w-3.5 h-3.5" aria-hidden />
                Restore
              </button>
            </>
          ) : (
            <>
              <label htmlFor="idea-status" className="sr-only">
                Status
              </label>
              <select
                id="idea-status"
                value={status}
                onChange={(e) => changeStatus(e.target.value)}
                className={`chip status-select ${STATUS_CSS[status as IdeaStatus] || "status-draft"}`}
              >
                {IDEA_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Category */}
          {isEditingCategory ? (
            <div className="flex items-center gap-1">
              <label htmlFor="idea-category-edit" className="sr-only">
                Category
              </label>
              <input
                id="idea-category-edit"
                ref={categoryRef}
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onBlur={saveCategory}
                onKeyDown={(e) => e.key === "Enter" && saveCategory()}
                autoFocus
                placeholder="Category"
                className="field field-sm w-36 font-mono"
              />
              <button
                type="button"
                onClick={saveCategory}
                className="btn btn-ghost btn-icon"
                aria-label="Save category"
              >
                <Check weight="bold" className="w-4 h-4" aria-hidden />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingCategory(true)}
              className="btn btn-ghost btn-sm font-mono group"
            >
              <Tag weight="bold" className="w-3.5 h-3.5" aria-hidden />
              {idea.category || "Add category"}
              <PencilSimple
                weight="bold"
                className="w-3 h-3 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-default"
                aria-hidden
              />
            </button>
          )}

          <span className="flex items-center gap-1.5 text-xs text-fg-muted font-mono ml-auto">
            <CalendarBlank weight="bold" className="w-3.5 h-3.5" aria-hidden />
            <span className="sr-only">Created</span>
            {createdDate}
          </span>
          {actions}
        </div>

        {/* Title */}
        {isEditingTitle ? (
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <label htmlFor="idea-title-edit" className="sr-only">
                Title
              </label>
              <input
                id="idea-title-edit"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleError("");
                }}
                onBlur={saveTitle}
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                autoFocus
                aria-invalid={!!titleError}
                className="field flex-1 text-2xl font-bold tracking-tight"
              />
              <button
                type="button"
                onClick={saveTitle}
                className="btn btn-primary btn-icon min-h-11 min-w-11"
                aria-label="Save title"
              >
                <Check weight="bold" className="w-5 h-5" aria-hidden />
              </button>
            </div>
            {titleError && (
              <p className="text-xs text-danger mt-1.5 font-medium" role="alert">
                {titleError}
              </p>
            )}
          </div>
        ) : (
          <h1 className="mb-2 text-[clamp(1.5rem,1.1rem+1.4vw,2rem)]">
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="group text-left inline-flex items-center gap-2.5 rounded-lg hover:text-fg-body transition-default cursor-text"
            >
              {title}
              <PencilSimple
                weight="bold"
                className="w-4 h-4 shrink-0 text-fg-muted opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-default"
                aria-hidden
              />
              <span className="sr-only">(edit title)</span>
            </button>
          </h1>
        )}

        {/* Description */}
        <label htmlFor="idea-description" className="sr-only">
          Description
        </label>
        <textarea
          id="idea-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={saveDescription}
          placeholder="Add a description..."
          className="w-full max-w-[70ch] bg-transparent text-[0.9375rem] text-fg-body placeholder:text-fg-muted rounded-lg -mx-2 px-2 py-1 resize-none hover:bg-surface-2 focus:bg-surface-2 transition-default"
          rows={2}
        />
      </section>

      {/* Launch confirmation */}
      <Modal
        open={showLaunchConfirm}
        onClose={() => setShowLaunchConfirm(false)}
        title="Launch this idea?"
        subtitle="Marks the idea as completed and shipped."
        icon={
          <span className="icon-badge tone-success">
            <Rocket weight="fill" className="w-5 h-5" aria-hidden />
          </span>
        }
      >
        <p className="text-sm text-fg-body mb-6">
          You&apos;re about to mark{" "}
          <span className="font-semibold text-fg">&quot;{idea.title}&quot;</span> as
          Launched. Confirm only once the idea has been completed or released.
        </p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowLaunchConfirm(false)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmLaunch}
            className="btn btn-primary"
            autoFocus
          >
            <Rocket weight="bold" className="w-4 h-4" aria-hidden />
            Confirm launch
          </button>
        </div>
      </Modal>
    </>
  );
}
