"use client";

import { useState } from "react";
import { updateIdea } from "@/app/actions";
import {
  IDEA_STATUSES,
  STATUS_LABELS,
  STATUS_CSS,
  type IdeaStatus,
} from "@/lib/constants";
import { PencilSimple, Check, Tag } from "@phosphor-icons/react";

type IdeaHeaderProps = {
  idea: {
    id: string;
    title: string;
    description: string;
    status: string;
    category: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export function IdeaHeader({ idea }: IdeaHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(idea.title);
  const [description, setDescription] = useState(idea.description);
  const [status, setStatus] = useState(idea.status);

  async function saveTitle() {
    if (title.trim() && title !== idea.title) {
      await updateIdea(idea.id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  }

  async function saveDescription() {
    if (description !== idea.description) {
      await updateIdea(idea.id, { description });
    }
  }

  async function changeStatus(newStatus: string) {
    setStatus(newStatus);
    await updateIdea(idea.id, { status: newStatus });
  }

  const createdDate = new Date(idea.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      {/* Status + Category row */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => changeStatus(e.target.value)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium font-mono border-none outline-none cursor-pointer ${STATUS_CSS[status as IdeaStatus] || "status-draft"}`}
        >
          {IDEA_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        {idea.category && (
          <span className="flex items-center gap-1 text-xs text-muted">
            <Tag weight="regular" className="w-3 h-3" />
            {idea.category}
          </span>
        )}

        <span className="text-xs text-muted/50 ml-auto font-mono">
          {createdDate}
        </span>
      </div>

      {/* Title */}
      {isEditingTitle ? (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === "Enter" && saveTitle()}
            autoFocus
            className="flex-1 bg-transparent text-xl font-semibold tracking-tight outline-none border-b border-accent/40 pb-1"
          />
          <button
            onClick={saveTitle}
            className="p-1.5 rounded-md hover:bg-surface-hover transition-default"
          >
            <Check weight="bold" className="w-4 h-4 text-accent" />
          </button>
        </div>
      ) : (
        <h1
          onClick={() => setIsEditingTitle(true)}
          className="text-xl font-semibold tracking-tight mb-3 cursor-pointer group flex items-center gap-2"
        >
          {title}
          <PencilSimple
            weight="regular"
            className="w-3.5 h-3.5 text-muted/30 opacity-0 group-hover:opacity-100 transition-default"
          />
        </h1>
      )}

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={saveDescription}
        placeholder="Add a description..."
        className="w-full bg-transparent text-sm text-muted placeholder:text-muted/30 outline-none resize-none leading-relaxed"
        rows={2}
      />
    </div>
  );
}
