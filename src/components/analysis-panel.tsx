"use client";

import { useState } from "react";
import { updateAnalysis } from "@/app/actions";
import {
  LEVELS,
  LEVEL_LABELS,
  LEVEL_CSS,
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

function LevelSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-default ${
            value === level
              ? `${LEVEL_CSS[level]} shadow-sm`
              : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
          }`}
        >
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
    <div className="border-b border-white/8 last:border-b-0 pb-6 mb-6 last:pb-0 last:mb-0">
      <div className="flex items-center gap-2.5 mb-3.5">
        <IconComponent weight="bold" className="w-4 h-4 text-emerald-400" />
        <h3 className="text-xs font-mono uppercase tracking-[0.14em] font-bold text-slate-300">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export function AnalysisPanel({ ideaId, analysis }: AnalysisPanelProps) {
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
    await updateAnalysis(ideaId, partial);
  }

  return (
    <div className="glass-card rounded-2xl p-6 shadow-md">
      <h2 className="text-base font-bold tracking-tight text-white mb-6">
        Analysis & Feasibility
      </h2>

      {/* Challenges */}
      <Section icon={Warning} title="Challenges">
        <textarea
          value={data.challenges}
          onChange={(e) => setData({ ...data, challenges: e.target.value })}
          onBlur={() => save({ challenges: data.challenges })}
          placeholder="What are the obstacles, risks, or technical challenges?"
          className="w-full bg-[#151a26]/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-[#1a2030] focus:shadow-[0_0_16px_rgba(16,185,129,0.2)] transition-default tracking-tight outline-none resize-y"
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
          className="w-full bg-[#151a26]/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-[#1a2030] focus:shadow-[0_0_16px_rgba(16,185,129,0.2)] transition-default tracking-tight outline-none resize-y"
          rows={3}
        />
      </Section>

      {/* Feasibility */}
      <Section icon={Gauge} title="Feasibility">
        <LevelSelector
          value={data.feasibility}
          onChange={(v) => save({ feasibility: v })}
        />
        <textarea
          value={data.feasibilityNotes}
          onChange={(e) =>
            setData({ ...data, feasibilityNotes: e.target.value })
          }
          onBlur={() => save({ feasibilityNotes: data.feasibilityNotes })}
          placeholder="Why this feasibility rating?"
          className="w-full mt-3 bg-[#151a26]/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-[#1a2030] focus:shadow-[0_0_16px_rgba(16,185,129,0.2)] transition-default tracking-tight outline-none resize-y"
          rows={2}
        />
      </Section>

      {/* Scalability */}
      <Section icon={ArrowsOutSimple} title="Scalability">
        <LevelSelector
          value={data.scalability}
          onChange={(v) => save({ scalability: v })}
        />
        <textarea
          value={data.scalabilityNotes}
          onChange={(e) =>
            setData({ ...data, scalabilityNotes: e.target.value })
          }
          onBlur={() => save({ scalabilityNotes: data.scalabilityNotes })}
          placeholder="How well can this scale? What's the ceiling?"
          className="w-full mt-3 bg-[#151a26]/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-[#1a2030] focus:shadow-[0_0_16px_rgba(16,185,129,0.2)] transition-default tracking-tight outline-none resize-y"
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
            className={`relative w-11 h-6 rounded-full transition-default ${
              data.canMonetize ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" : "bg-slate-800"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-default ${
                data.canMonetize ? "translate-x-[20px]" : ""
              }`}
            />
          </button>
          <span className="text-sm font-semibold text-white tracking-tight">
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
            className="w-full bg-[#151a26]/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-[#1a2030] focus:shadow-[0_0_16px_rgba(16,185,129,0.2)] transition-default tracking-tight outline-none resize-y"
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
          className="w-full bg-[#151a26]/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-[#1a2030] focus:shadow-[0_0_16px_rgba(16,185,129,0.2)] transition-default tracking-tight outline-none resize-y"
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
          className="w-full bg-[#151a26]/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-[#1a2030] focus:shadow-[0_0_16px_rgba(16,185,129,0.2)] transition-default tracking-tight outline-none resize-y"
          rows={4}
        />
      </Section>
    </div>
  );
}
