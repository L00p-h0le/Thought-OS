export const IDEA_STATUSES = [
  "DRAFT",
  "EXPLORING",
  "BUILDING",
  "LAUNCHED",
  "ARCHIVED",
] as const;

export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export const STATUS_LABELS: Record<IdeaStatus, string> = {
  DRAFT: "Draft",
  EXPLORING: "Exploring",
  BUILDING: "Building",
  LAUNCHED: "Launched",
  ARCHIVED: "Archived",
};

export const STATUS_CSS: Record<IdeaStatus, string> = {
  DRAFT: "status-draft",
  EXPLORING: "status-exploring",
  BUILDING: "status-building",
  LAUNCHED: "status-launched",
  ARCHIVED: "status-archived",
};

export const LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const LEVEL_CSS: Record<Level, string> = {
  LOW: "level-low",
  MEDIUM: "level-medium",
  HIGH: "level-high",
};

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};
