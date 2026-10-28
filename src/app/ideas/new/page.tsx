"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createIdea } from "@/app/actions";
import { IDEA_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { WarningCircle } from "@phosphor-icons/react";
import { PageHeader } from "@/components/page-header";
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
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="New idea"
        description="Capture it before it fades."
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "New idea" }]}
      />

      <form
        ref={formRef}
        action={handleSubmit}
        className="tile p-5 md:p-8 space-y-6 animate-in"
        style={{ animationDelay: "60ms" }}
        noValidate
      >
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium"
            style={{
              color: "var(--danger)",
              background: "color-mix(in oklab, var(--danger) 10%, transparent)",
              borderColor: "color-mix(in oklab, var(--danger) 30%, transparent)",
            }}
          >
            <WarningCircle weight="bold" className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
            {error}
          </div>
        )}

        <div>
          <label htmlFor="idea-title" className="block text-sm font-semibold mb-1.5">
            Title <span className="text-danger" aria-hidden>*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="idea-title"
            type="text"
            name="title"
            required
            maxLength={200}
            autoFocus
            placeholder="What's the idea?"
            className="field text-base"
          />
        </div>

        <div>
          <label htmlFor="idea-desc" className="block text-sm font-semibold mb-1.5">
            Description
          </label>
          <textarea
            id="idea-desc"
            name="description"
            rows={4}
            maxLength={5000}
            placeholder="Describe the idea in a few sentences..."
            className="field resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="idea-category" className="block text-sm font-semibold mb-1.5">
              Category <span className="text-fg-muted font-normal">(optional)</span>
            </label>
            <input
              id="idea-category"
              type="text"
              name="category"
              placeholder="e.g. SaaS, Mobile App"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="idea-status" className="block text-sm font-semibold mb-1.5">
              Status
            </label>
            <select
              id="idea-status"
              name="status"
              defaultValue="DRAFT"
              className="field"
            >
              {IDEA_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-line -mx-5 md:-mx-8 px-5 md:px-8 pt-5">
          <Link href="/" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className="btn btn-primary sm:min-w-36">
            {submitting ? "Creating..." : "Create idea"}
          </button>
        </div>
      </form>
    </div>
  );
}
