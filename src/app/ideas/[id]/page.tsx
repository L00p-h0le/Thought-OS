import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { IdeaHeader } from "@/components/idea-header";
import { AnalysisPanel } from "@/components/analysis-panel";
import { TaskTracker } from "@/components/task-tracker";
import { DeleteIdeaButton } from "@/components/delete-idea-button";
import { PageHeader } from "@/components/page-header";

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
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: idea.title }]}
      />

      <div className="animate-in" style={{ animationDelay: "40ms" }}>
        <IdeaHeader idea={idea} actions={<DeleteIdeaButton ideaId={idea.id} />} />
      </div>

      {/* Asymmetric split: analysis (primary) + sticky tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6 mt-6 items-start">
        <div className="animate-in" style={{ animationDelay: "80ms" }}>
          <AnalysisPanel ideaId={idea.id} analysis={idea.analysis} />
        </div>
        <div
          className="animate-in lg:sticky lg:top-6"
          style={{ animationDelay: "120ms" }}
        >
          <TaskTracker ideaId={idea.id} tasks={idea.tasks} />
        </div>
      </div>
    </div>
  );
}
