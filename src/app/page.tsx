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
      color: "text-accent",
    },
    {
      label: "Building",
      value: statusCounts["BUILDING"] || 0,
      icon: Target,
      color: "text-yellow-400",
    },
    {
      label: "Launched",
      value: statusCounts["LAUNCHED"] || 0,
      icon: TrendUp,
      color: "text-emerald-400",
    },
    {
      label: "Tasks Done",
      value: totalTasks > 0 ? `${doneTasks}/${totalTasks}` : "0",
      icon: CheckCircle,
      color: "text-blue-400",
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted mt-1">
            {ideas.length} idea{ideas.length !== 1 ? "s" : ""} captured
          </p>
        </div>
        <Link
          href="/ideas/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent-hover transition-default active:scale-[0.98]"
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
            className="bg-surface border border-border rounded-xl p-5 hover:border-surface-active transition-default"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center">
                <stat.icon weight="fill" className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted mt-0.5 font-mono uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Add */}
      <div className="mb-8 animate-in" style={{ animationDelay: "200ms" }}>
        <QuickAddForm />
      </div>

      {/* Ideas Grid */}
      {ideas.length === 0 ? (
        <div className="text-center py-20 animate-in">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-4">
            <Lightning weight="thin" className="w-8 h-8 text-muted" />
          </div>
          <h2 className="text-lg font-medium mb-2">No ideas yet</h2>
          <p className="text-sm text-muted mb-6">
            Start capturing your ideas. Every great product started as a thought.
          </p>
          <Link
            href="/ideas/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent-hover transition-default"
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
                className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4 hover:border-surface-active hover:bg-surface-hover/50 transition-default group"
              >
                {/* Status badge */}
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium font-mono ${STATUS_CSS[idea.status as IdeaStatus] || "status-draft"}`}
                >
                  {STATUS_LABELS[idea.status as IdeaStatus] || idea.status}
                </span>

                {/* Title + desc */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate group-hover:text-foreground">
                    {idea.title}
                  </h3>
                  {idea.description && (
                    <p className="text-xs text-muted truncate mt-0.5">
                      {idea.description}
                    </p>
                  )}
                </div>

                {/* Indicators */}
                <div className="flex items-center gap-3 shrink-0">
                  {idea.analysis && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${LEVEL_CSS[idea.analysis.feasibility as Level] || ""}`}
                    >
                      {idea.analysis.feasibility}
                    </span>
                  )}

                  {idea.analysis?.canMonetize && (
                    <span className="text-[10px] font-mono text-accent">$</span>
                  )}

                  {/* Task progress */}
                  {totalIdTasks > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-active rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted">
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
