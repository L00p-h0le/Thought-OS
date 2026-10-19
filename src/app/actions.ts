"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

/* ─── Idea CRUD ─── */

export async function createIdea(formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || "";
  const category = (formData.get("category") as string) || null;
  const status = (formData.get("status") as string) || "DRAFT";

  if (!title?.trim()) throw new Error("Title is required");

  const idea = await prisma.idea.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      category: category?.trim() || null,
      status: status || "DRAFT",
      analysis: { create: {} },
    },
  });

  revalidatePath("/");
  revalidatePath(`/ideas/${idea.id}`);
  return idea;
}

export async function updateIdea(
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    category?: string | null;
  }
) {
  await prisma.idea.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath(`/ideas/${id}`);
}

export async function deleteIdea(id: string) {
  await prisma.idea.delete({ where: { id } });
  revalidatePath("/");
}

/* ─── Analysis ─── */

export async function updateAnalysis(
  ideaId: string,
  data: {
    challenges?: string;
    knowledgeGap?: string;
    feasibility?: string;
    feasibilityNotes?: string;
    scalability?: string;
    scalabilityNotes?: string;
    canMonetize?: boolean;
    monetizationStrategy?: string;
    howToBuild?: string;
    freeformNotes?: string;
  }
) {
  await prisma.ideaAnalysis.upsert({
    where: { ideaId },
    update: data,
    create: { ideaId, ...data },
  });
  revalidatePath(`/ideas/${ideaId}`);
}

/* ─── Tasks ─── */

export async function createTask(formData: FormData) {
  const ideaId = formData.get("ideaId") as string;
  const title = formData.get("title") as string;
  const priority = (formData.get("priority") as string) || "MEDIUM";

  if (!title?.trim()) throw new Error("Task title is required");

  const maxOrder = await prisma.task.aggregate({
    where: { ideaId },
    _max: { sortOrder: true },
  });

  await prisma.task.create({
    data: {
      ideaId,
      title: title.trim(),
      priority,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/ideas/${ideaId}`);
}

export async function updateTask(
  id: string,
  ideaId: string,
  data: { title?: string; status?: string; priority?: string; description?: string }
) {
  await prisma.task.update({ where: { id }, data });
  revalidatePath(`/ideas/${ideaId}`);
}

export async function deleteTask(id: string, ideaId: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath(`/ideas/${ideaId}`);
}
