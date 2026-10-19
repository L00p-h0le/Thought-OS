"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { createIdea } from "@/app/actions";
import { IDEA_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { ArrowLeft, Lightning } from "@phosphor-icons/react";
import Link from "next/link";

export default function NewIdeaPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    const idea = await createIdea(formData);
    router.push(`/ideas/${idea.id}`);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-in">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-default mb-4"
        >
          <ArrowLeft weight="regular" className="w-4 h-4" />
          Back
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Lightning weight="fill" className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">New Idea</h1>
            <p className="text-sm text-muted">Capture it before it fades</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        ref={formRef}
        action={handleSubmit}
        className="space-y-6 animate-in"
        style={{ animationDelay: "100ms" }}
      >
        {/* Title */}
        <div>
          <label
            htmlFor="idea-title"
            className="block text-xs font-mono uppercase tracking-wider text-muted mb-2"
          >
            Title
          </label>
          <input
            id="idea-title"
            type="text"
            name="title"
            required
            placeholder="What's the idea?"
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus-ring transition-default focus:border-accent/40"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="idea-desc"
            className="block text-xs font-mono uppercase tracking-wider text-muted mb-2"
          >
            Description
          </label>
          <textarea
            id="idea-desc"
            name="description"
            rows={4}
            placeholder="Describe the idea in a few sentences..."
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus-ring transition-default focus:border-accent/40 resize-y"
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="idea-category"
            className="block text-xs font-mono uppercase tracking-wider text-muted mb-2"
          >
            Category
            <span className="text-muted/40 ml-1 normal-case tracking-normal">
              (optional)
            </span>
          </label>
          <input
            id="idea-category"
            type="text"
            name="category"
            placeholder="e.g. SaaS, Mobile App, Side Project"
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus-ring transition-default focus:border-accent/40"
          />
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="idea-status"
            className="block text-xs font-mono uppercase tracking-wider text-muted mb-2"
          >
            Status
          </label>
          <select
            id="idea-status"
            name="status"
            defaultValue="DRAFT"
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-foreground focus-ring transition-default focus:border-accent/40 appearance-none cursor-pointer"
          >
            {IDEA_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-3 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent-hover transition-default active:scale-[0.98]"
          >
            Create Idea
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-lg bg-surface border border-border text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-default"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
