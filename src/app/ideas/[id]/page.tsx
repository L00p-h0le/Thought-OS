import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Trash } from "@phosphor-icons/react/dist/ssr";
import { IdeaHeader } from "@/components/idea-header";
import { AnalysisPanel } from "@/components/analysis-panel";
import { TaskTracker } from "@/components/task-tracker";
import { DeleteIdeaButton } from "@/components/delete-idea-button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function IdeaDetailPage({ params }: Props) {
  const { id } = await params;

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      analysis: true,
      tasks: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!idea) notFound();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back nav */}
      <div className="flex items-center justify-between mb-6 animate-in">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-default"
        >
          <ArrowLeft weight="regular" className="w-4 h-4" />
          Dashboard
        </Link>
        <DeleteIdeaButton ideaId={idea.id} />
      </div>

      {/* Header */}
      <div className="animate-in" style={{ animationDelay: "50ms" }}>
        <IdeaHeader idea={idea} />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        {/* Analysis — 3/5 */}
        <div
          className="lg:col-span-3 animate-in"
          style={{ animationDelay: "100ms" }}
        >
          <AnalysisPanel ideaId={idea.id} analysis={idea.analysis} />
        </div>

        {/* Tracker — 2/5 */}
        <div
          className="lg:col-span-2 animate-in"
          style={{ animationDelay: "150ms" }}
        >
          <TaskTracker ideaId={idea.id} tasks={idea.tasks} />
        </div>
      </div>
    </div>
  );
}
