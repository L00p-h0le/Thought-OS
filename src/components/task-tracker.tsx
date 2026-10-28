"use client";

import { useRef, useState, useMemo } from "react";
import { createTask, updateTask, deleteTask } from "@/app/actions";
import { useToast } from "@/components/toast-provider";
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  type TaskStatus,
} from "@/lib/constants";
import {
  Plus,
  Circle,
  CircleHalf,
  CheckCircle,
  Trash,
  CaretDown,
  PencilSimple,
  Check,
  X,
  CalendarBlank,
  ArrowDown,
  ArrowUp,
  Equals,
} from "@phosphor-icons/react";
import { Segmented } from "@/components/segmented";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  sortOrder: number;
  completedAt: Date | string | null;
  dueDate: Date | string | null;
  createdAt?: Date | string;
};

type TaskTrackerProps = {
  ideaId: string;
  tasks: Task[];
};

const STATUS_ICONS: Record<string, typeof Circle> = {
  TODO: Circle,
  IN_PROGRESS: CircleHalf,
  DONE: CheckCircle,
};

const STATUS_COLORS: Record<string, string> = {
  TODO: "text-fg-muted hover:text-fg",
  IN_PROGRESS: "text-warning",
  DONE: "text-success",
};

const PRIORITY_ICONS: Record<string, typeof Circle> = {
  LOW: ArrowDown,
  MEDIUM: Equals,
  HIGH: ArrowUp,
};

function parseDate(val: Date | string | null | undefined): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function nextStatus(current: string): string {
  const order = ["TODO", "IN_PROGRESS", "DONE"];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

function nextPriority(current: string): string {
  const order = ["LOW", "MEDIUM", "HIGH"];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

function formatCompletedDate(val: Date | string | null | undefined): string | null {
  const d = parseDate(val);
  if (!d) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCreatedDate(val: Date | string | null | undefined): string | null {
  const d = parseDate(val);
  if (!d) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDueDate(val: Date | string | null | undefined): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
} | null {
  const d = parseDate(val);
  if (!d) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays < 0;
  const isToday = diffDays === 0;
  const isTomorrow = diffDays === 1;

  let label: string;
  if (isToday) {
    label = "Today";
  } else if (isTomorrow) {
    label = "Tomorrow";
  } else if (isOverdue) {
    label = `${Math.abs(diffDays)}d overdue`;
  } else {
    label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return { label, isOverdue, isToday };
}

function toDateInputValue(val: Date | string | null | undefined): string {
  const d = parseDate(val);
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TaskTracker({ ideaId, tasks }: TaskTrackerProps) {
  const { success, info, error } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const progress = tasks.length > 0 ? (doneTasks / tasks.length) * 100 : 0;
  const progressLabel =
    tasks.length === 0 ? "Not started" : `${doneTasks}/${tasks.length}`;

  const statusCounts = useMemo(() => {
    return {
      ALL: tasks.length,
      TODO: tasks.filter((t) => t.status === "TODO").length,
      IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      DONE: tasks.filter((t) => t.status === "DONE").length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === "ALL") return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  async function handleAddTask(formData: FormData) {
    setFormError(null);
    const title = (formData.get("title") as string)?.trim();
    if (!title) {
      setFormError("Task title is required");
      return;
    }
    formData.set("ideaId", ideaId);
    try {
      await createTask(formData);
      formRef.current?.reset();
      success("Task added", `"${title}" has been created.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create task";
      setFormError(msg);
      error("Task creation failed", msg);
    }
  }

  async function cycleStatus(task: Task) {
    const newStatus = nextStatus(task.status);
    try {
      await updateTask(task.id, ideaId, { status: newStatus });
    } catch (err: unknown) {
      error("Failed to update status", err instanceof Error ? err.message : undefined);
    }
  }

  async function cyclePriority(task: Task) {
    const newPriority = nextPriority(task.priority);
    try {
      await updateTask(task.id, ideaId, { priority: newPriority });
    } catch (err: unknown) {
      error("Failed to update priority", err instanceof Error ? err.message : undefined);
    }
  }

  function startEditing(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  }

  async function saveEditTitle(taskId: string) {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== tasks.find((t) => t.id === taskId)?.title) {
      try {
        await updateTask(taskId, ideaId, { title: trimmed });
        success("Task title updated");
      } catch (err: unknown) {
        error("Failed to update task", err instanceof Error ? err.message : undefined);
      }
    }
    setEditingTaskId(null);
  }

  async function handleDelete(taskId: string) {
    setConfirmDeleteId(null);
    try {
      await deleteTask(taskId, ideaId);
      info("Task deleted");
    } catch (err: unknown) {
      error("Failed to delete task", err instanceof Error ? err.message : undefined);
    }
  }


  // Row actions stay hidden until hover/focus on fine pointers, always visible on touch.
  const revealOnHover =
    "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-100 [@media(pointer:coarse)]:opacity-100";

  return (
    <div className="tile p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          Tasks
          {tasks.length > 0 && (
            <span className="text-xs font-mono font-medium text-fg-muted">
              ({tasks.length})
            </span>
          )}
        </h2>
        <span className="text-xs font-mono font-semibold text-fg-body tabular-nums">
          {progressLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="progress-track mb-5"
        role="progressbar"
        aria-label="Tasks completed"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Filter */}
      <Segmented
        label="Filter tasks"
        className="w-full mb-4 [&>*]:flex-1"
        value={filter}
        onChange={setFilter}
        options={[
          { id: "ALL", label: "All", count: statusCounts.ALL },
          { id: "TODO", label: "To do", count: statusCounts.TODO },
          { id: "IN_PROGRESS", label: "Doing", count: statusCounts.IN_PROGRESS },
          { id: "DONE", label: "Done", count: statusCounts.DONE },
        ]}
      />

      {/* Add task form */}
      <form
        ref={formRef}
        action={handleAddTask}
        className="space-y-2.5 mb-4 p-3 rounded-xl bg-surface-2 border border-line"
      >
        <div className="flex items-center gap-2">
          <label htmlFor="new-task-title" className="sr-only">
            New task
          </label>
          <input
            id="new-task-title"
            type="text"
            name="title"
            required
            maxLength={200}
            placeholder="Add a task..."
            className="field flex-1 bg-surface"
          />
          <button type="submit" className="btn btn-primary shrink-0">
            <Plus weight="bold" className="w-4 h-4" aria-hidden />
            Add
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex items-center gap-2">
            <span className="eyebrow">Priority</span>
            <select
              name="priority"
              defaultValue="MEDIUM"
              className="field field-sm w-auto bg-surface"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="eyebrow flex items-center gap-1">
              <CalendarBlank weight="bold" className="w-3 h-3" aria-hidden />
              Due
            </span>
            <input
              type="date"
              name="dueDate"
              className="field field-sm w-auto bg-surface"
            />
          </label>
        </div>

        {formError && (
          <p className="text-xs text-danger font-medium" role="alert">
            {formError}
          </p>
        )}
      </form>

      {/* Task list */}
      <ul className="space-y-1">
        {filteredTasks.length === 0 && (
          <li className="text-sm text-fg-muted text-center py-8">
            {filter === "ALL"
              ? "No tasks yet. Break this idea down into actionable steps."
              : `No ${TASK_STATUS_LABELS[filter as TaskStatus]?.toLowerCase()} tasks`}
          </li>
        )}

        {filteredTasks.map((task) => {
          const StatusIcon = STATUS_ICONS[task.status] || Circle;
          const statusColor = STATUS_COLORS[task.status] || "text-fg-muted";
          const PriorityIcon = PRIORITY_ICONS[task.priority] || Equals;
          const isExpanded = expandedTask === task.id;
          const isEditing = editingTaskId === task.id;
          const isConfirmingDelete = confirmDeleteId === task.id;
          const completedLabel = formatCompletedDate(task.completedAt);
          const createdLabel = formatCreatedDate(task.createdAt);
          const dueDateInfo = formatDueDate(task.dueDate);
          const statusLabel = TASK_STATUS_LABELS[task.status as TaskStatus] || task.status;
          const priorityLabel =
            PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS] || task.priority;

          return (
            <li
              key={task.id}
              className={`group rounded-xl border transition-default ${
                isExpanded
                  ? "bg-surface-2 border-line"
                  : "border-transparent hover:bg-surface-2"
              }`}
            >
              <div className="flex items-center gap-2 pl-1 pr-1.5 py-1">
                {/* Status toggle */}
                <button
                  type="button"
                  onClick={() => cycleStatus(task)}
                  className={`btn btn-ghost btn-icon shrink-0 ${statusColor}`}
                  aria-label={`Status: ${statusLabel}. Change status`}
                  title={`${statusLabel} — click to cycle`}
                >
                  <StatusIcon
                    weight={task.status === "DONE" ? "fill" : "bold"}
                    className="w-5 h-5"
                    aria-hidden
                  />
                </button>

                {/* Title — inline edit or display */}
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-1 min-w-0">
                    <label htmlFor={`task-edit-${task.id}`} className="sr-only">
                      Task title
                    </label>
                    <input
                      id={`task-edit-${task.id}`}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => saveEditTitle(task.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditTitle(task.id);
                        if (e.key === "Escape") setEditingTaskId(null);
                      }}
                      autoFocus
                      maxLength={200}
                      className="field field-sm flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => saveEditTitle(task.id)}
                      className="btn btn-ghost btn-icon text-success"
                      aria-label="Save title"
                    >
                      <Check weight="bold" className="w-4 h-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTaskId(null)}
                      className="btn btn-ghost btn-icon"
                      aria-label="Cancel editing"
                    >
                      <X weight="bold" className="w-4 h-4" aria-hidden />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0 py-1.5">
                    <span
                      onDoubleClick={() => startEditing(task)}
                      className={`block text-sm font-medium truncate ${
                        task.status === "DONE"
                          ? "line-through text-fg-muted"
                          : "text-fg"
                      }`}
                      title="Double-click to edit"
                    >
                      {task.title}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">

                      {/* Due Date Indicator */}
                      {dueDateInfo && (
                        <span
                          className={`chip ${
                            task.status === "DONE"
                              ? ""
                              : dueDateInfo.isOverdue
                                ? "tone-danger"
                                : dueDateInfo.isToday
                                  ? "tone-warning"
                                  : "tone-info"
                          }`}
                          title={
                            dueDateInfo.isOverdue
                              ? "Task is overdue"
                              : `Due date: ${dueDateInfo.label}`
                          }
                        >
                          <CalendarBlank weight="bold" className="w-3 h-3" aria-hidden />
                          <span className="sr-only">Due</span>
                          {dueDateInfo.label}
                        </span>
                      )}

                      {/* Priority — click to cycle */}
                      <button
                        type="button"
                        onClick={() => cyclePriority(task)}
                        aria-label={`Priority: ${priorityLabel}. Change priority`}
                        title={`${priorityLabel} priority — click to cycle`}
                        className={`chip priority-${task.priority.toLowerCase()} cursor-pointer hover:brightness-110`}
                      >
                        <PriorityIcon weight="bold" className="w-3 h-3" aria-hidden />
                        {priorityLabel}
                      </button>
                    </div>
                  </div>
                )}

                {/* Expand details */}
                <button
                  type="button"
                  onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`task-details-${task.id}`}
                  aria-label="Task details"
                  className={`btn btn-ghost btn-icon shrink-0 ${isExpanded ? "" : revealOnHover}`}
                >
                  <CaretDown
                    weight="bold"
                    className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>

                {/* Delete with confirmation */}
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      className="btn btn-danger btn-icon"
                      aria-label="Confirm delete"
                    >
                      <Check weight="bold" className="w-4 h-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="btn btn-ghost btn-icon"
                      aria-label="Cancel delete"
                    >
                      <X weight="bold" className="w-4 h-4" aria-hidden />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(task.id)}
                    className={`btn btn-ghost-danger btn-icon shrink-0 ${revealOnHover}`}
                    aria-label="Delete task"
                  >
                    <Trash weight="bold" className="w-4 h-4" aria-hidden />
                  </button>
                )}
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div
                  id={`task-details-${task.id}`}
                  className="px-3 pb-3 pt-1 space-y-3 animate-in"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="eyebrow w-16">Priority</span>
                    <Segmented
                      label="Priority"
                      value={task.priority}
                      onChange={(p) => updateTask(task.id, ideaId, { priority: p })}
                      options={PRIORITIES.map((p) => ({ id: p, label: PRIORITY_LABELS[p] }))}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="eyebrow w-16">Status</span>
                    <Segmented
                      label="Status"
                      value={task.status}
                      onChange={(s) => updateTask(task.id, ideaId, { status: s })}
                      options={TASK_STATUSES.map((s) => ({ id: s, label: TASK_STATUS_LABELS[s] }))}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor={`task-due-${task.id}`} className="eyebrow w-16">
                      Due date
                    </label>
                    <input
                      id={`task-due-${task.id}`}
                      type="date"
                      value={toDateInputValue(task.dueDate)}
                      onChange={(e) =>
                        updateTask(task.id, ideaId, {
                          dueDate: e.target.value || null,
                        })
                      }
                      className="field field-sm w-auto bg-surface"
                    />
                    {task.dueDate && (
                      <button
                        type="button"
                        onClick={() => updateTask(task.id, ideaId, { dueDate: null })}
                        className="btn btn-ghost btn-sm"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="eyebrow w-16">Title</span>
                      <button
                        type="button"
                        onClick={() => startEditing(task)}
                        className="btn btn-ghost btn-sm"
                      >
                        <PencilSimple weight="bold" className="w-3.5 h-3.5" aria-hidden />
                        Edit title
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-fg-muted border-t border-line">
                    {createdLabel && <span>Created {createdLabel}</span>}
                    {completedLabel && (
                      <span className="text-success">Completed {completedLabel}</span>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
