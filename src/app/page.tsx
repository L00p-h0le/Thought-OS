import Link from "next/link";
import { prisma } from "@/lib/db";
import { STATUS_LABELS, STATUS_CSS, LEVEL_CSS } from "@/lib/constants";
import type { IdeaStatus, Level } from "@/lib/constants";
import {
  Plus,
  Lightning,
  Target,
  TrendUp,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr";
import { QuickAddForm } from "@/components/quick-add-form";

export default async function DashboardPage() {
  const ideas = await prisma.idea.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      analysis: {
        select: { feasibility: true, scalability: true, canMonetize: true },
      },
      tasks: { select: { status: true } },
    },
  });

  const statusCounts = ideas.reduce(
    (acc, idea) => {
      acc[idea.status as IdeaStatus] = (acc[idea.status as IdeaStatus] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalTasks = ideas.reduce((sum, i) => sum + i.tasks.length, 0);
  const doneTasks = ideas.reduce(
    (sum, i) => sum + i.tasks.filter((t) => t.status === "DONE").length,
    0
  );

  const stats = [
    {
      label: "Total Ideas",
      value: ideas.length,
      icon: Lightning,
      iconBox: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]",
    },
    {
      label: "Building",
      value: statusCounts["BUILDING"] || 0,
      icon: Target,
      iconBox: "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]",
    },
    {
      label: "Launched",
      value: statusCounts["LAUNCHED"] || 0,
      icon: TrendUp,
      iconBox: "bg-teal-500/15 border-teal-500/30 text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.25)]",
    },
    {
      label: "Tasks Done",
      value: totalTasks > 0 ? `${doneTasks}/${totalTasks}` : "0",
      icon: CheckCircle,
      iconBox: "bg-indigo-500/15 border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.25)]",
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-in">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.06)]">
            Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            {ideas.length} idea{ideas.length !== 1 ? "s" : ""} captured
          </p>
        </div>
        <Link
          href="/ideas/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-accent text-sm font-bold tracking-tight transition-default active:scale-[0.98] cursor-pointer"
        >
          <Plus weight="bold" className="w-4 h-4" />
          New Idea
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-card glass-card-hover rounded-2xl p-5 transition-default group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-default group-hover:scale-105 ${stat.iconBox}`}
              >
                <stat.icon weight="fill" className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-white tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              {stat.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono uppercase tracking-[0.14em] font-semibold">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Add */}
      <div className="mb-8 animate-in" style={{ animationDelay: "120ms" }}>
        <QuickAddForm />
      </div>

      {/* Ideas Grid */}
      {ideas.length === 0 ? (
        <div className="text-center py-20 px-6 glass-card rounded-3xl border border-white/12 relative overflow-hidden animate-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border border-emerald-500/35 shadow-[0_0_32px_rgba(16,185,129,0.25)] flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <Lightning weight="fill" className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-2">
            No ideas yet
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
            Start capturing your ideas. Every great product started as a thought.
          </p>
          <Link
            href="/ideas/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-accent text-sm font-bold tracking-tight transition-default active:scale-[0.98]"
          >
            <Plus weight="bold" className="w-4 h-4" />
            Add Your First Idea
          </Link>
        </div>
      ) : (
        <div className="space-y-2 stagger">
          {ideas.map((idea) => {
            const tasksDone = idea.tasks.filter((t) => t.status === "DONE").length;
            const totalIdTasks = idea.tasks.length;
            const progress =
              totalIdTasks > 0 ? (tasksDone / totalIdTasks) * 100 : 0;

            return (
              <Link
                key={idea.id}
                href={`/ideas/${idea.id}`}
                className="flex items-center gap-4 glass-card glass-card-hover rounded-xl p-4 transition-default group"
              >
                {/* Status badge */}
                <span
                  className={`shrink-0 px-3 py-1 rounded-md text-xs font-semibold font-mono tracking-wide ${STATUS_CSS[idea.status as IdeaStatus] || "status-draft"}`}
                >
                  {STATUS_LABELS[idea.status as IdeaStatus] || idea.status}
                </span>

                {/* Title + desc */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold tracking-tight text-slate-200 group-hover:text-white transition-default truncate">
                    {idea.title}
                  </h3>
                  {idea.description && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {idea.description}
                    </p>
                  )}
                </div>

                {/* Indicators */}
                <div className="flex items-center gap-3 shrink-0">
                  {idea.analysis && (
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold ${LEVEL_CSS[idea.analysis.feasibility as Level] || ""}`}
                    >
                      {idea.analysis.feasibility}
                    </span>
                  )}

                  {idea.analysis?.canMonetize && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                      $
                    </span>
                  )}

                  {/* Task progress */}
                  {totalIdTasks > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono tabular-nums text-slate-400 font-semibold">
                        {tasksDone}/{totalIdTasks}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
