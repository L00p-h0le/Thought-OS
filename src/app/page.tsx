import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import type { IdeaStatus } from "@/lib/constants";
import {
  Plus,
  Lightning,
  Target,
  TrendUp,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr";
import { QuickAddForm } from "@/components/quick-add-form";
import { IdeaList, type SerializedIdea } from "@/components/idea-list";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const initialQuery =
    typeof resolvedParams.q === "string" ? resolvedParams.q : "";
  const initialStatus =
    typeof resolvedParams.status === "string" ? resolvedParams.status : "ACTIVE";
  const initialCategory =
    typeof resolvedParams.category === "string"
      ? resolvedParams.category
      : "ALL";
  const initialSort =
    typeof resolvedParams.sort === "string" ? resolvedParams.sort : "updated";

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

  const activeIdeas = ideas.filter((i) => i.status !== "ARCHIVED");
  const totalTasks = activeIdeas.reduce((sum, i) => sum + i.tasks.length, 0);
  const doneTasks = activeIdeas.reduce(
    (sum, i) => sum + i.tasks.filter((t) => t.status === "DONE").length,
    0
  );

  const stats = [
    {
      label: "Total Ideas",
      value: activeIdeas.length,
      href: "/?status=ACTIVE",
      icon: Lightning,
      iconBox:
        "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]",
    },
    {
      label: "Building",
      value: statusCounts["BUILDING"] || 0,
      href: "/?status=BUILDING",
      icon: Target,
      iconBox:
        "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]",
    },
    {
      label: "Launched",
      value: statusCounts["LAUNCHED"] || 0,
      href: "/?status=LAUNCHED",
      icon: TrendUp,
      iconBox:
        "bg-teal-500/15 border-teal-500/30 text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.25)]",
    },
    {
      label: "Tasks Done",
      value: totalTasks > 0 ? `${doneTasks}/${totalTasks}` : "0",
      href: "/?status=ACTIVE&sort=tasks",
      icon: CheckCircle,
      iconBox:
        "bg-indigo-500/15 border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.25)]",
    },
  ];

  const serializedIdeas: SerializedIdea[] = ideas.map((idea) => ({
    id: idea.id,
    title: idea.title,
    description: idea.description,
    category: idea.category,
    status: idea.status,
    createdAt: idea.createdAt.toISOString(),
    updatedAt: idea.updatedAt.toISOString(),
    archivedAt: idea.archivedAt?.toISOString() ?? null,
    analysis: idea.analysis
      ? {
          feasibility: idea.analysis.feasibility,
          scalability: idea.analysis.scalability,
          canMonetize: idea.analysis.canMonetize,
        }
      : null,
    tasks: idea.tasks.map((t) => ({ status: t.status })),
  }));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-in">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.06)]">
            Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            {activeIdeas.length} active idea{activeIdeas.length !== 1 ? "s" : ""}
            {statusCounts["ARCHIVED"] ? ` (${statusCounts["ARCHIVED"]} archived)` : ""}
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

      {/* Stats Cards (Linked to filters per spec §3.6) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="glass-card glass-card-hover rounded-2xl p-5 transition-default group cursor-pointer block"
            title={`Filter by ${stat.label}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-default group-hover:scale-105 ${stat.iconBox}`}
              >
                <stat.icon weight="fill" className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-default">
                view &rarr;
              </span>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-white tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              {stat.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono uppercase tracking-[0.14em] font-semibold">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Add */}
      <div className="mb-8 animate-in" style={{ animationDelay: "120ms" }}>
        <QuickAddForm />
      </div>

      {/* Ideas List with Search, Filter & Sort */}
      <Suspense
        fallback={
          <div className="text-center py-12 text-slate-400 text-sm font-mono">
            Loading ideas...
          </div>
        }
      >
        <IdeaList
          ideas={serializedIdeas}
          initialQuery={initialQuery}
          initialStatus={initialStatus}
          initialCategory={initialCategory}
          initialSort={initialSort}
        />
      </Suspense>
    </div>
  );
}
