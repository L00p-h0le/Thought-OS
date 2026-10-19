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
    <div className="glass-card rounded-2xl p-6 shadow-md">
      {/* Status + Category row */}
      <div className="flex items-center gap-3 mb-4">
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

        {idea.category && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium text-slate-300 bg-white/6 border border-white/10">
            <Tag weight="bold" className="w-3.5 h-3.5 text-emerald-400" />
            {idea.category}
          </span>
        )}

        <span className="text-[11px] text-slate-400 ml-auto font-mono tracking-wider font-medium">
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
            className="flex-1 bg-transparent text-2xl font-bold tracking-tight text-white outline-none border-b-2 border-emerald-400 pb-1"
          />
          <button
            onClick={saveTitle}
            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-emerald-950 transition-default"
          >
            <Check weight="bold" className="w-5 h-5" />
          </button>
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
  );
}
