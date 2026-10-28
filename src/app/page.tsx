import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { STATUS_LABELS, type IdeaStatus } from "@/lib/constants";
import { STATUS_ICONS } from "@/lib/status-icons";
import {
  Plus,
  Lightning,
  CheckCircle,
  Rocket,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { QuickAddForm } from "@/components/quick-add-form";
import { IdeaList, type SerializedIdea } from "@/components/idea-list";
import { PageHeader } from "@/components/page-header";
import { IdeaListSkeleton } from "@/components/skeletons";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Pipeline stages shown in the hero tile, with the semantic colour for each.
const PIPELINE: { status: IdeaStatus; bar: string }[] = [
  { status: "DRAFT", bar: "bg-neutral" },
  { status: "EXPLORING", bar: "bg-info" },
  { status: "BUILDING", bar: "bg-warning" },
  { status: "LAUNCHED", bar: "bg-success" },
];

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
  const taskProgress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  // Implementation Rate: Launched / (Exploring + Building + Launched) * 100 per spec §3.6
  const eligibleIdeas = ideas.filter(
    (i) =>
      i.status === "EXPLORING" ||
      i.status === "BUILDING" ||
      i.status === "LAUNCHED"
  );
  const launchedCount = statusCounts["LAUNCHED"] || 0;
  const implementationRate =
    eligibleIdeas.length > 0
      ? `${Math.round((launchedCount / eligibleIdeas.length) * 100)}%`
      : "N/A";

  const pipelineTotal = PIPELINE.reduce(
    (sum, p) => sum + (statusCounts[p.status] || 0),
    0
  );

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
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Dashboard"
        description={
          <>
            {activeIdeas.length} active idea{activeIdeas.length !== 1 ? "s" : ""}
            {statusCounts["ARCHIVED"] ? ` · ${statusCounts["ARCHIVED"]} archived` : ""}
          </>
        }
        actions={
          <Link href="/ideas/new" className="btn btn-primary max-md:hidden">
            <Plus weight="bold" className="w-4 h-4" aria-hidden />
            New Idea
          </Link>
        }
      />

      {/* Bento overview — DOM order follows priority (largest tile first). */}
      <section
        aria-label="Overview"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 stagger"
      >
        {/* Hero: ship rate + pipeline */}
        <article className="tile col-span-2 lg:row-span-2 p-6 flex flex-col">
          <div className="flex items-center gap-2 text-fg-muted">
            <Rocket weight="bold" className="w-4 h-4" aria-hidden />
            <h2 className="eyebrow">Ship rate</h2>
          </div>
          <p className="mt-3 text-5xl font-bold tracking-tight tabular-nums text-fg">
            {implementationRate}
          </p>
          <p className="text-sm text-fg-muted mt-1">
            {launchedCount} launched of {eligibleIdeas.length} in progress or shipped
          </p>

          <div className="mt-auto pt-6">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-3 gap-0.5"
              aria-hidden
            >
              {pipelineTotal > 0 &&
                PIPELINE.map(({ status, bar }) => {
                  const count = statusCounts[status] || 0;
                  if (!count) return null;
                  return (
                    <span
                      key={status}
                      className={bar}
                      style={{ width: `${(count / pipelineTotal) * 100}%` }}
                    />
                  );
                })}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1">
              {PIPELINE.map(({ status, bar }) => {
                const Icon = STATUS_ICONS[status];
                return (
                  <li key={status}>
                    <Link
                      href={`/?status=${status}`}
                      className="flex items-center gap-2.5 rounded-lg px-2 -mx-2 min-h-10 text-sm text-fg-body hover:bg-surface-2 hover:text-fg transition-default"
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${bar}`} aria-hidden />
                      <Icon weight="bold" className="w-3.5 h-3.5 text-fg-muted" aria-hidden />
                      <span className="font-medium">{STATUS_LABELS[status]}</span>
                      <span className="ml-auto font-mono tabular-nums text-fg">
                        {statusCounts[status] || 0}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </article>

        {/* Quick capture */}
        <article className="tile col-span-2 p-6">
          <div className="flex items-center gap-2 text-fg-muted mb-3">
            <Lightning weight="bold" className="w-4 h-4" aria-hidden />
            <h2 className="eyebrow">Quick capture</h2>
          </div>
          <QuickAddForm />
          <p className="text-xs text-fg-muted mt-2.5">
            Saved as a draft. Add details and analysis later.
          </p>
        </article>

        {/* Active ideas */}
        <Link
          href="/?status=ACTIVE"
          className="tile tile-interactive p-6 flex flex-col group"
        >
          <span className="flex items-center gap-2 text-fg-muted">
            <Lightning weight="bold" className="w-4 h-4" aria-hidden />
            <span className="eyebrow">Active ideas</span>
          </span>
          <span className="mt-3 text-3xl font-bold tabular-nums text-fg">
            {activeIdeas.length}
          </span>
          <span className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-semibold text-fg-muted group-hover:text-accent transition-default">
            View all <ArrowRight weight="bold" className="w-3 h-3" aria-hidden />
          </span>
        </Link>

        {/* Tasks */}
        <Link
          href="/?status=ACTIVE&sort=tasks"
          className="tile tile-interactive p-6 flex flex-col group"
        >
          <span className="flex items-center gap-2 text-fg-muted">
            <CheckCircle weight="bold" className="w-4 h-4" aria-hidden />
            <span className="eyebrow">Tasks done</span>
          </span>
          <span className="mt-3 text-3xl font-bold tabular-nums text-fg">
            {doneTasks}
            <span className="text-lg text-fg-muted font-semibold">/{totalTasks}</span>
          </span>
          <span className="mt-auto pt-3 block">
            <span className="progress-track block">
              <span
                className="progress-fill block"
                style={{ width: `${taskProgress}%` }}
              />
            </span>
          </span>
        </Link>
      </section>

      {/* Ideas */}
      <section aria-labelledby="ideas-heading">
        <h2 id="ideas-heading" className="text-xl font-bold mb-4">
          Ideas
        </h2>
        <Suspense fallback={<IdeaListSkeleton />}>
          <IdeaList
            ideas={serializedIdeas}
            initialQuery={initialQuery}
            initialStatus={initialStatus}
            initialCategory={initialCategory}
            initialSort={initialSort}
          />
        </Suspense>
      </section>
    </div>
  );
}
