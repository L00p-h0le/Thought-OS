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
  Clock,
} from "@phosphor-icons/react";

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
  TODO: "text-slate-400 hover:text-slate-200",
  IN_PROGRESS: "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]",
  DONE: "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]",
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


  return (
    <div className="glass-card rounded-2xl p-6 shadow-md border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span>Tracker</span>
          {tasks.length > 0 && (
            <span className="text-[11px] font-mono font-medium text-slate-400">
              ({tasks.length})
            </span>
          )}
        </h2>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-md tabular-nums">
          {progressLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden border border-white/5 mb-5">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-[#121622] border border-white/10 rounded-xl p-1">
        {[
          { id: "ALL", label: "All", count: statusCounts.ALL },
          { id: "TODO", label: "To Do", count: statusCounts.TODO },
          {
            id: "IN_PROGRESS",
            label: "In Progress",
            count: statusCounts.IN_PROGRESS,
          },
          { id: "DONE", label: "Done", count: statusCounts.DONE },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-default cursor-pointer ${
              filter === tab.id
                ? "bg-white/12 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filter === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-slate-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Add task form */}
      <form
        ref={formRef}
        action={handleAddTask}
        className="space-y-2 mb-4 p-3 rounded-xl bg-[#121622]/80 border border-white/8"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            name="title"
            required
            maxLength={200}
            placeholder="Add a new task..."
            className="flex-1 bg-[#151a26] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-emerald-500/50 transition-default tracking-tight"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold transition-default active:scale-[0.96] shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0 text-xs"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          {/* Priority selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Priority:
            </span>
            <select
              name="priority"
              defaultValue="MEDIUM"
              className="bg-[#151a26] border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Optional Due Date */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              <CalendarBlank weight="bold" className="w-3 h-3 text-slate-400" />
              Due:
            </span>
            <input
              type="date"
              name="dueDate"
              className="bg-[#151a26] border border-white/10 rounded-lg px-2 py-0.5 text-xs text-slate-300 outline-none focus:border-emerald-500/50 cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>

        {formError && (
          <p className="text-[11px] text-rose-400 font-mono pt-1">{formError}</p>
        )}
      </form>

      {/* Task list */}
      <div className="space-y-1.5">
        {filteredTasks.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6 font-medium">
            {filter === "ALL"
              ? "No tasks yet. Break this idea down into actionable steps."
              : `No ${TASK_STATUS_LABELS[filter as TaskStatus]?.toLowerCase()} tasks found`}
          </p>
        )}

        {filteredTasks.map((task) => {
          const StatusIcon = STATUS_ICONS[task.status] || Circle;
          const statusColor = STATUS_COLORS[task.status] || "text-slate-400";
          const isExpanded = expandedTask === task.id;
          const isEditing = editingTaskId === task.id;
          const isConfirmingDelete = confirmDeleteId === task.id;
          const completedLabel = formatCompletedDate(task.completedAt);
          const createdLabel = formatCreatedDate(task.createdAt);
          const dueDateInfo = formatDueDate(task.dueDate);

          return (
            <div
              key={task.id}
              className="group rounded-xl hover:bg-white/6 transition-default border border-transparent hover:border-white/5"
            >
              <div className="flex items-center gap-3 px-3 py-2.5">
                {/* Status toggle */}
                <button
                  type="button"
                  onClick={() => cycleStatus(task)}
                  className={`shrink-0 transition-default hover:scale-115 cursor-pointer ${statusColor}`}
                  title={`Status: ${task.status}. Click to cycle.`}
                >
                  <StatusIcon
                    weight={task.status === "DONE" ? "fill" : "bold"}
                    className="w-5 h-5"
                  />
                </button>

                {/* Title — inline edit or display */}
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-1.5 min-w-0">
                    <input
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
                      className="flex-1 bg-transparent text-sm font-medium tracking-tight text-white outline-none border-b border-emerald-400 pb-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => saveEditTitle(task.id)}
                      className="p-0.5 rounded text-emerald-400 hover:bg-emerald-500/20 transition-default cursor-pointer"
                    >
                      <Check weight="bold" className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTaskId(null)}
                      className="p-0.5 rounded text-slate-400 hover:bg-white/10 transition-default cursor-pointer"
                    >
                      <X weight="bold" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span
                    onDoubleClick={() => startEditing(task)}
                    className={`flex-1 text-sm font-medium tracking-tight truncate cursor-default ${
                      task.status === "DONE"
                        ? "line-through text-slate-400"
                        : "text-slate-200"
                    }`}
                    title="Double-click to edit"
                  >
                    {task.title}
                  </span>
                )}

                {/* Due Date Indicator */}
                {dueDateInfo && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border tracking-wide font-medium shrink-0 ${
                      task.status === "DONE"
                        ? "text-slate-400 bg-white/5 border-white/5"
                        : dueDateInfo.isOverdue
                          ? "text-rose-400 bg-rose-500/15 border-rose-500/35 shadow-[0_0_8px_rgba(244,63,94,0.25)] font-semibold"
                          : dueDateInfo.isToday
                            ? "text-amber-400 bg-amber-500/15 border-amber-500/35 font-semibold"
                            : "text-teal-400 bg-teal-500/10 border-teal-500/25"
                    }`}
                    title={
                      dueDateInfo.isOverdue
                        ? "Task is overdue"
                        : `Due date: ${dueDateInfo.label}`
                    }
                  >
                    <CalendarBlank weight="bold" className="w-3 h-3" />
                    {dueDateInfo.label}
                  </span>
                )}

                {/* Completed timestamp */}
                {completedLabel && (
                  <span className="text-[9px] font-mono text-emerald-500/70 tracking-wider hidden sm:block shrink-0">
                    ✓ {completedLabel}
                  </span>
                )}

                {/* Priority indicator — interactive cycle */}
                <button
                  type="button"
                  onClick={() => cyclePriority(task)}
                  title={`Priority: ${task.priority}. Click to cycle.`}
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border tracking-wider font-bold transition-default hover:scale-105 cursor-pointer shrink-0 ${
                    task.priority === "HIGH"
                      ? "text-rose-400 bg-rose-950/40 border-rose-500/35 shadow-[0_0_8px_rgba(244,63,94,0.25)]"
                      : task.priority === "MEDIUM"
                        ? "text-amber-400 bg-amber-950/40 border-amber-500/35 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
                        : "text-slate-400 bg-slate-900/40 border-slate-700/40"
                  }`}
                >
                  {task.priority[0]}
                </button>

                {/* Expand details button */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTask(isExpanded ? null : task.id)
                  }
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-default cursor-pointer shrink-0"
                  title="Toggle details"
                >
                  <CaretDown
                    weight="bold"
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Delete with confirmation */}
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-default cursor-pointer"
                      title="Confirm delete"
                    >
                      <Check weight="bold" className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="p-1 rounded text-slate-400 hover:bg-white/10 transition-default cursor-pointer"
                      title="Cancel"
                    >
                      <X weight="bold" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(task.id)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-default cursor-pointer shrink-0"
                    title="Delete task"
                  >
                    <Trash weight="bold" className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-9 pb-3 space-y-2.5 animate-in">
                  {/* Priority selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold w-16">
                      Priority
                    </span>
                    <div className="flex gap-1">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() =>
                            updateTask(task.id, ideaId, { priority: p })
                          }
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold transition-default cursor-pointer ${
                            task.priority === p
                              ? `priority-${p.toLowerCase()} bg-white/15 border border-white/20`
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {PRIORITY_LABELS[p]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold w-16">
                      Status
                    </span>
                    <div className="flex gap-1">
                      {TASK_STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            updateTask(task.id, ideaId, { status: s })
                          }
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold transition-default cursor-pointer ${
                            task.status === s
                              ? "text-white bg-white/15 border border-white/20"
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {TASK_STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Due Date picker */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold w-16">
                      Due Date
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={toDateInputValue(task.dueDate)}
                        onChange={(e) =>
                          updateTask(task.id, ideaId, {
                            dueDate: e.target.value || null,
                          })
                        }
                        className="bg-[#151a26] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-emerald-500/50 cursor-pointer [color-scheme:dark]"
                      />
                      {task.dueDate && (
                        <button
                          type="button"
                          onClick={() =>
                            updateTask(task.id, ideaId, { dueDate: null })
                          }
                          className="text-[10px] font-mono text-slate-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-white/5 transition-default cursor-pointer"
                          title="Remove due date"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Edit title action */}
                  {!isEditing && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold w-16">
                        Title
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditing(task)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold text-slate-400 hover:text-white transition-default cursor-pointer hover:bg-white/5"
                      >
                        <PencilSimple weight="bold" className="w-3 h-3" />
                        Edit title
                      </button>
                    </div>
                  )}

                  {/* Creation & Completion metadata */}
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-[10px] font-mono text-slate-500 border-t border-white/5">
                    {createdLabel && <span>Created: {createdLabel}</span>}
                    {completedLabel && (
                      <span className="text-emerald-500/70">
                        Completed: {completedLabel}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
