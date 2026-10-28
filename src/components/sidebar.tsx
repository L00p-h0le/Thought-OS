import { prisma } from "@/lib/db";
import { AppNav } from "@/components/app-nav";

export async function Sidebar() {
  const ideas = await prisma.idea.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, status: true },
    take: 20,
  });

  return <AppNav recentIdeas={ideas} />;
}
