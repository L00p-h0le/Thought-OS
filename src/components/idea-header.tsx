"use client";

import { useState, useRef } from "react";
import { updateIdea, archiveIdea, restoreIdea, launchIdea } from "@/app/actions";
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
  Archive,
  ArrowCounterClockwise,
  X,
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
};

export function IdeaHeader({ idea }: IdeaHeaderProps) {
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
      await updateIdea(idea.id, { title: trimmed });
    }
    setIsEditingTitle(false);
  }

  async function saveDescription() {
    if (description !== idea.description) {
      await updateIdea(idea.id, { description });
    }
  }

  async function saveCategory() {
    const trimmed = category.trim();
    const newCat = trimmed || null;
    if (newCat !== idea.category) {
      await updateIdea(idea.id, { category: newCat });
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
      await archiveIdea(idea.id);
      return;
    }
    setStatus(newStatus);
    await updateIdea(idea.id, { status: newStatus });
  }

  async function confirmLaunch() {
    setStatus("LAUNCHED");
    setShowLaunchConfirm(false);
    await launchIdea(idea.id);
  }

  async function handleRestore() {
    setStatus("EXPLORING");
    await restoreIdea(idea.id);
  }

  const isArchived = status === "ARCHIVED";

  const createdDate = new Date(idea.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <div className="glass-card rounded-2xl p-6 shadow-md">
        {/* Status + Category row */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {isArchived ? (
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-wide border ${STATUS_CSS["ARCHIVED"]}`}>
                Archived
              </span>
              <button
                type="button"
                onClick={handleRestore}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 transition-default active:scale-[0.98] cursor-pointer"
              >
                <ArrowCounterClockwise weight="bold" className="w-3.5 h-3.5" />
                Restore
              </button>
            </div>
          ) : (
            <select
              value={status}
              onChange={(e) => changeStatus(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-wide border outline-none cursor-pointer ${STATUS_CSS[status as IdeaStatus] || "status-draft"}`}
            >
              {IDEA_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#121622] text-white">
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          )}

          {/* Category */}
          {isEditingCategory ? (
            <div className="flex items-center gap-1.5">
              <Tag weight="bold" className="w-3.5 h-3.5 text-emerald-400" />
              <input
                ref={categoryRef}
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onBlur={saveCategory}
                onKeyDown={(e) => e.key === "Enter" && saveCategory()}
                autoFocus
                placeholder="Category"
                className="bg-transparent text-xs font-mono font-medium text-white outline-none border-b border-emerald-400 pb-0.5 w-32"
              />
              <button
                type="button"
                onClick={saveCategory}
                className="p-0.5 rounded text-emerald-400 hover:bg-emerald-500/20 transition-default"
              >
                <Check weight="bold" className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingCategory(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium text-slate-300 bg-white/6 border border-white/10 hover:border-white/20 hover:text-white transition-default cursor-pointer group"
            >
              <Tag weight="bold" className="w-3.5 h-3.5 text-emerald-400" />
              {idea.category || "Add category"}
              <PencilSimple weight="bold" className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-default" />
            </button>
          )}

          <span className="text-[11px] text-slate-400 ml-auto font-mono tracking-wider font-medium">
            {createdDate}
          </span>
        </div>

        {/* Title */}
        {isEditingTitle ? (
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleError("");
                }}
                onBlur={saveTitle}
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                autoFocus
                className="flex-1 bg-transparent text-2xl font-bold tracking-tight text-white outline-none border-b-2 border-emerald-400 pb-1"
              />
              <button
                onClick={saveTitle}
                className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-emerald-950 transition-default"
              >
                <Check weight="bold" className="w-5 h-5" />
              </button>
            </div>
            {titleError && (
              <p className="text-xs text-rose-400 mt-1.5 font-medium">{titleError}</p>
            )}
          </div>
        ) : (
          <h1
            onClick={() => setIsEditingTitle(true)}
            className="text-2xl font-bold tracking-tight text-white mb-3 cursor-pointer group flex items-center gap-2.5 hover:text-emerald-300 transition-default"
          >
            {title}
            <PencilSimple
              weight="bold"
              className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-default"
            />
          </h1>
        )}

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={saveDescription}
          placeholder="Add a description..."
          className="w-full bg-transparent text-sm text-slate-300 focus:text-white placeholder:text-slate-500 outline-none resize-none leading-relaxed tracking-tight transition-default"
          rows={2}
        />
      </div>

      {/* Launch confirmation modal */}
      {showLaunchConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 border border-white/15 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center text-emerald-400">
                <Rocket weight="fill" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-white">
                  Launch this idea?
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  This marks the idea as completed and shipped.
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              You&apos;re about to mark <span className="font-semibold text-white">&quot;{idea.title}&quot;</span> as Launched. This is an explicit action confirming the idea has been completed or released.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={confirmLaunch}
                className="flex-1 py-3 rounded-xl btn-accent text-sm font-bold tracking-tight transition-default active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <Rocket weight="bold" className="w-4 h-4" />
                Confirm Launch
              </button>
              <button
                type="button"
                onClick={() => setShowLaunchConfirm(false)}
                className="px-5 py-3 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 text-sm font-semibold text-slate-300 hover:text-white transition-default cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
