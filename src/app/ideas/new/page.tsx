"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createIdea } from "@/app/actions";
import { IDEA_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { ArrowLeft, Lightning } from "@phosphor-icons/react";
import Link from "next/link";

export default function NewIdeaPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    const title = (formData.get("title") as string)?.trim();
    if (!title) {
      setError("Title is required");
      return;
    }
    if (title.length > 200) {
      setError("Title must be 200 characters or less");
      return;
    }

    setSubmitting(true);
    try {
      const idea = await createIdea(formData);
      router.push(`/ideas/${idea.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create idea");
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-in">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-default mb-4 group"
        >
          <ArrowLeft weight="bold" className="w-4 h-4 group-hover:-translate-x-1 transition-default" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center text-emerald-400">
            <Lightning weight="fill" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              New Idea
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Capture it before it fades
            </p>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-sm text-rose-400 font-medium animate-in">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        ref={formRef}
        action={handleSubmit}
        className="space-y-6 glass-card rounded-2xl p-8 border border-white/10 shadow-lg animate-in"
        style={{ animationDelay: "80ms" }}
      >
        {/* Title */}
        <div>
          <label
            htmlFor="idea-title"
            className="block text-xs font-mono uppercase tracking-[0.12em] font-bold text-slate-300 mb-2"
          >
            Title <span className="text-rose-400">*</span>
          </label>
          <input
            id="idea-title"
            type="text"
            name="title"
            required
            maxLength={200}
            placeholder="What's the idea?"
            className="w-full bg-[#151a26]/90 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-[#1a2030] focus:shadow-[0_0_16px_rgba(16,185,129,0.2)] tracking-tight outline-none transition-default"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="idea-desc"
            className="block text-xs font-mono uppercase tracking-[0.12em] font-bold text-slate-300 mb-2"
          >
            Description
          </label>
          <textarea
            id="idea-desc"
            name="description"
            rows={4}
            maxLength={5000}
            placeholder="Describe the idea in a few sentences..."
            className="w-full bg-[#151a26]/90 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-[#1a2030] focus:shadow-[0_0_16px_rgba(16,185,129,0.2)] tracking-tight outline-none transition-default resize-y"
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="idea-category"
            className="block text-xs font-mono uppercase tracking-[0.12em] font-bold text-slate-300 mb-2"
          >
            Category
            <span className="text-slate-500 ml-1.5 normal-case font-normal">
              (optional)
            </span>
          </label>
          <input
            id="idea-category"
            type="text"
            name="category"
            placeholder="e.g. SaaS, Mobile App, Side Project"
            className="w-full bg-[#151a26]/90 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-[#1a2030] focus:shadow-[0_0_16px_rgba(16,185,129,0.2)] tracking-tight outline-none transition-default"
          />
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="idea-status"
            className="block text-xs font-mono uppercase tracking-[0.12em] font-bold text-slate-300 mb-2"
          >
            Status
          </label>
          <select
            id="idea-status"
            name="status"
            defaultValue="DRAFT"
            className="w-full bg-[#151a26] border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold font-mono text-white focus:border-emerald-500/50 outline-none cursor-pointer tracking-wide"
          >
            {IDEA_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-[#121622] text-white">
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3.5 rounded-xl btn-accent text-sm font-bold tracking-tight transition-default active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Idea"}
          </button>
          <Link
            href="/"
            className="px-6 py-3.5 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 text-sm font-semibold tracking-tight text-slate-300 hover:text-white transition-default"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
