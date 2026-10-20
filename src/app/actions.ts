"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { IDEA_STATUSES, TASK_STATUSES, PRIORITIES, LEVELS } from "@/lib/constants";

const VALID_STATUSES = new Set(IDEA_STATUSES);
const VALID_TASK_STATUSES = new Set(TASK_STATUSES);
const VALID_PRIORITIES = new Set(PRIORITIES);
const VALID_LEVELS = new Set(LEVELS);
const MAX_TITLE_LENGTH = 200;
const MAX_TEXT_LENGTH = 5000;

function clampText(value: string | undefined, max: number): string {
  return (value || "").slice(0, max);
}

/* ─── Idea CRUD ─── */

export async function createIdea(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const description = clampText(formData.get("description") as string, MAX_TEXT_LENGTH).trim();
  const category = (formData.get("category") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "DRAFT";

  if (!title) throw new Error("Title is required");
  if (title.length > MAX_TITLE_LENGTH) throw new Error(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
  if (!VALID_STATUSES.has(status as typeof IDEA_STATUSES[number])) throw new Error("Invalid status");

  const idea = await prisma.idea.create({
    data: {
      title,
      description,
      category,
      status,
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
  if (data.title !== undefined) {
    data.title = data.title.trim();
    if (!data.title) throw new Error("Title is required");
    if (data.title.length > MAX_TITLE_LENGTH) throw new Error(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
  }
  if (data.description !== undefined) {
    data.description = clampText(data.description, MAX_TEXT_LENGTH);
  }
  if (data.status !== undefined && !VALID_STATUSES.has(data.status as typeof IDEA_STATUSES[number])) {
    throw new Error("Invalid status");
  }

  await prisma.idea.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath(`/ideas/${id}`);
}

export async function archiveIdea(id: string) {
  await prisma.idea.update({
    where: { id },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  });
  revalidatePath("/");
  revalidatePath(`/ideas/${id}`);
}

export async function restoreIdea(id: string) {
  await prisma.idea.update({
    where: { id },
    data: { status: "EXPLORING", archivedAt: null },
  });
  revalidatePath("/");
  revalidatePath(`/ideas/${id}`);
}

export async function launchIdea(id: string) {
  await prisma.idea.update({
    where: { id },
    data: { status: "LAUNCHED" },
  });
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
  // Validate ratings
  if (data.feasibility && !VALID_LEVELS.has(data.feasibility as typeof LEVELS[number])) {
    throw new Error("Invalid feasibility rating");
  }
  if (data.scalability && !VALID_LEVELS.has(data.scalability as typeof LEVELS[number])) {
    throw new Error("Invalid scalability rating");
  }

  // Clamp text fields
  const textFields = ["challenges", "knowledgeGap", "feasibilityNotes", "scalabilityNotes", "monetizationStrategy", "howToBuild", "freeformNotes"] as const;
  for (const field of textFields) {
    if (data[field] !== undefined) {
      (data as Record<string, unknown>)[field] = clampText(data[field] as string, MAX_TEXT_LENGTH);
    }
  }

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
  const title = (formData.get("title") as string)?.trim();
  const priority = (formData.get("priority") as string) || "MEDIUM";
  const dueDateRaw = (formData.get("dueDate") as string)?.trim();

  if (!title) throw new Error("Task title is required");
  if (title.length > MAX_TITLE_LENGTH) throw new Error(`Task title must be ${MAX_TITLE_LENGTH} characters or less`);
  if (!VALID_PRIORITIES.has(priority as typeof PRIORITIES[number])) throw new Error("Invalid priority");

  const ideaExists = await prisma.idea.findUnique({
    where: { id: ideaId },
    select: { id: true },
  });
  if (!ideaExists) throw new Error("Idea not found");

  let dueDate: Date | null = null;
  if (dueDateRaw) {
    const parsed = new Date(dueDateRaw);
    if (!isNaN(parsed.getTime())) {
      dueDate = parsed;
    }
  }

  const maxOrder = await prisma.task.aggregate({
    where: { ideaId },
    _max: { sortOrder: true },
  });

  await prisma.task.create({
    data: {
      ideaId,
      title,
      priority,
      dueDate,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/ideas/${ideaId}`);
}

export async function updateTask(
  id: string,
  ideaId: string,
  data: {
    title?: string;
    status?: string;
    priority?: string;
    description?: string;
    dueDate?: string | null | Date;
  }
) {
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) {
    const trimmedTitle = data.title.trim();
    if (!trimmedTitle) throw new Error("Task title is required");
    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      throw new Error(`Task title must be ${MAX_TITLE_LENGTH} characters or less`);
    }
    updateData.title = trimmedTitle;
  }

  if (data.description !== undefined) {
    updateData.description = clampText(data.description, 5000);
  }

  if (data.status !== undefined) {
    if (!VALID_TASK_STATUSES.has(data.status as typeof TASK_STATUSES[number])) {
      throw new Error("Invalid task status");
    }
    updateData.status = data.status;
    if (data.status === "DONE") {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }
  }

  if (data.priority !== undefined) {
    if (!VALID_PRIORITIES.has(data.priority as typeof PRIORITIES[number])) {
      throw new Error("Invalid priority");
    }
    updateData.priority = data.priority;
  }

  if (data.dueDate !== undefined) {
    if (data.dueDate === null || data.dueDate === "") {
      updateData.dueDate = null;
    } else {
      const parsed = new Date(data.dueDate);
      if (isNaN(parsed.getTime())) throw new Error("Invalid due date");
      updateData.dueDate = parsed;
    }
  }

  const result = await prisma.task.updateMany({
    where: { id, ideaId },
    data: updateData,
  });

  if (result.count === 0) throw new Error("Task not found for this idea");

  revalidatePath(`/ideas/${ideaId}`);
}

export async function deleteTask(id: string, ideaId: string) {
  const result = await prisma.task.deleteMany({
    where: { id, ideaId },
  });

  if (result.count === 0) throw new Error("Task not found for this idea");

  revalidatePath(`/ideas/${ideaId}`);
}

