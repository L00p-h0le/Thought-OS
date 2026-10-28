"use client";

import { useState } from "react";
import { updateAnalysis } from "@/app/actions";
import { useToast } from "@/components/toast-provider";
import {
  LEVELS,
  LEVEL_LABELS,
  type Level,
} from "@/lib/constants";
import {
  Warning,
  BookOpen,
  Gauge,
  ArrowsOutSimple,
  CurrencyDollar,
  Wrench,
  NotePencil,
  Check,
  type Icon,
} from "@phosphor-icons/react";

type Analysis = {
  id: string;
  challenges: string;
  knowledgeGap: string;
  feasibility: string;
  feasibilityNotes: string;
  scalability: string;
  scalabilityNotes: string;
  canMonetize: boolean;
  monetizationStrategy: string;
  howToBuild: string;
  freeformNotes: string;
} | null;

type AnalysisPanelProps = {
  ideaId: string;
  analysis: Analysis;
};

const LEVEL_DOT: Record<Level, string> = {
  LOW: "bg-danger",
  MEDIUM: "bg-warning",
  HIGH: "bg-success",
};

function LevelSelector({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="segmented">
      {LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          aria-pressed={value === level}
          onClick={() => onChange(level)}
          className="segmented-item min-w-20"
        >
          {value === level && (
            <span className={`w-2 h-2 rounded-full ${LEVEL_DOT[level]}`} aria-hidden />
          )}
          {LEVEL_LABELS[level]}
        </button>
      ))}
    </div>
  );
}

function Section({
  icon: IconComponent,
  title,
  children,
}: {
  icon: Icon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line last:border-b-0 pb-6 mb-6 last:pb-0 last:mb-0">
      <div className="flex items-center gap-2 mb-3 text-fg-muted">
        <IconComponent weight="bold" className="w-4 h-4" aria-hidden />
        <h3 className="eyebrow">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function AnalysisPanel({ ideaId, analysis }: AnalysisPanelProps) {
  const { error } = useToast();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [data, setData] = useState({
    challenges: analysis?.challenges || "",
    knowledgeGap: analysis?.knowledgeGap || "",
    feasibility: analysis?.feasibility || "MEDIUM",
    feasibilityNotes: analysis?.feasibilityNotes || "",
    scalability: analysis?.scalability || "MEDIUM",
    scalabilityNotes: analysis?.scalabilityNotes || "",
    canMonetize: analysis?.canMonetize || false,
    monetizationStrategy: analysis?.monetizationStrategy || "",
    howToBuild: analysis?.howToBuild || "",
    freeformNotes: analysis?.freeformNotes || "",
  });

  async function save(partial: Partial<typeof data>) {
    const updated = { ...data, ...partial };
    setData(updated);
    setSaveState("saving");
    try {
      await updateAnalysis(ideaId, partial);
      setSaveState("saved");
      setTimeout(() => {
        setSaveState((curr) => (curr === "saved" ? "idle" : curr));
      }, 2500);
    } catch (err: unknown) {
      setSaveState("error");
      const msg = err instanceof Error ? err.message : "Failed to save analysis";
      error("Save failed", msg);
    }
  }

  return (
    <div className="tile p-5 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Analysis &amp; feasibility</h2>
        <div className="text-xs font-mono" aria-live="polite">
          {saveState === "saving" && (
            <span className="text-fg-muted flex items-center gap-1.5 animate-pulse font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" aria-hidden />
              Saving...
            </span>
          )}
          {saveState === "saved" && (
            <span className="text-success flex items-center gap-1 font-semibold">
              <Check weight="bold" className="w-3.5 h-3.5" aria-hidden />
              Saved
            </span>
          )}
          {saveState === "error" && (
            <span className="text-danger flex items-center gap-1 font-semibold">
              <Warning weight="bold" className="w-3.5 h-3.5" aria-hidden />
              Save failed
            </span>
          )}
        </div>
      </div>

      {/* Challenges */}
      <Section icon={Warning} title="Challenges">
        <textarea
          value={data.challenges}
          onChange={(e) => setData({ ...data, challenges: e.target.value })}
          onBlur={() => save({ challenges: data.challenges })}
          placeholder="What are the obstacles, risks, or technical challenges?"
          className="field resize-y"
          rows={3}
        />
      </Section>

      {/* Knowledge Gap */}
      <Section icon={BookOpen} title="Knowledge Gap">
        <textarea
          value={data.knowledgeGap}
          onChange={(e) => setData({ ...data, knowledgeGap: e.target.value })}
          onBlur={() => save({ knowledgeGap: data.knowledgeGap })}
          placeholder="What do you need to learn or research to build this?"
          className="field resize-y"
          rows={3}
        />
      </Section>

      {/* Feasibility */}
      <Section icon={Gauge} title="Feasibility">
        <LevelSelector
          value={data.feasibility}
          onChange={(v) => save({ feasibility: v })}
          label="Feasibility"
        />
        <textarea
          value={data.feasibilityNotes}
          onChange={(e) =>
            setData({ ...data, feasibilityNotes: e.target.value })
          }
          onBlur={() => save({ feasibilityNotes: data.feasibilityNotes })}
          placeholder="Why this feasibility rating?"
          className="field mt-3 resize-y"
          rows={2}
        />
      </Section>

      {/* Scalability */}
      <Section icon={ArrowsOutSimple} title="Scalability">
        <LevelSelector
          value={data.scalability}
          onChange={(v) => save({ scalability: v })}
          label="Scalability"
        />
        <textarea
          value={data.scalabilityNotes}
          onChange={(e) =>
            setData({ ...data, scalabilityNotes: e.target.value })
          }
          onBlur={() => save({ scalabilityNotes: data.scalabilityNotes })}
          placeholder="How well can this scale? What's the ceiling?"
          className="field mt-3 resize-y"
          rows={2}
        />
      </Section>

      {/* Monetization */}
      <Section icon={CurrencyDollar} title="Monetization">
        <label className="flex items-center gap-3 cursor-pointer mb-3">
          <button
            type="button"
            role="switch"
            aria-checked={data.canMonetize}
            onClick={() => save({ canMonetize: !data.canMonetize })}
            className={`relative w-11 h-6 rounded-full border transition-default ${
              data.canMonetize ? "bg-accent border-accent" : "bg-surface-3 border-line-input"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full shadow-sm transition-default ${
                data.canMonetize ? "translate-x-5 bg-on-accent" : "bg-fg-muted"
              }`}
            />
          </button>
          <span className="text-sm font-semibold text-fg">
            {data.canMonetize ? "Yes, monetizable" : "Not monetizable"}
          </span>
        </label>
        {data.canMonetize && (
          <textarea
            value={data.monetizationStrategy}
            onChange={(e) =>
              setData({ ...data, monetizationStrategy: e.target.value })
            }
            onBlur={() =>
              save({ monetizationStrategy: data.monetizationStrategy })
            }
            placeholder="How would you monetize? Subscription, one-time, freemium, usage-based..."
            className="field resize-y"
            rows={3}
          />
        )}
      </Section>

      {/* How to Build */}
      <Section icon={Wrench} title="How to Build">
        <textarea
          value={data.howToBuild}
          onChange={(e) => setData({ ...data, howToBuild: e.target.value })}
          onBlur={() => save({ howToBuild: data.howToBuild })}
          placeholder="Tech stack, architecture, MVP approach, phases..."
          className="field resize-y"
          rows={4}
        />
      </Section>

      {/* Free-form Notes */}
      <Section icon={NotePencil} title="Notes">
        <textarea
          value={data.freeformNotes}
          onChange={(e) => setData({ ...data, freeformNotes: e.target.value })}
          onBlur={() => save({ freeformNotes: data.freeformNotes })}
          placeholder="Any additional thoughts, links, references..."
          className="field resize-y"
          rows={4}
        />
      </Section>
    </div>
  );
}
