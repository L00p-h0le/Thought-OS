"use client";

import { useRef, useState } from "react";
import { createTask, updateTask, deleteTask } from "@/app/actions";
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
} from "@phosphor-icons/react";

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  sortOrder: number;
  completedAt: Date | null;
  dueDate: Date | null;
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

function nextStatus(current: string): string {
  const order = ["TODO", "IN_PROGRESS", "DONE"];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

function formatCompletedDate(date: Date | null): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TaskTracker({ ideaId, tasks }: TaskTrackerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const progress = tasks.length > 0 ? (doneTasks / tasks.length) * 100 : 0;
  const progressLabel = tasks.length === 0 ? "Not started" : `${doneTasks}/${tasks.length}`;

  const filteredTasks =
    filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  async function handleAddTask(formData: FormData) {
    formData.set("ideaId", ideaId);
    await createTask(formData);
    formRef.current?.reset();
  }

  async function cycleStatus(task: Task) {
    const newStatus = nextStatus(task.status);
    await updateTask(task.id, ideaId, { status: newStatus });
  }

  function startEditing(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  }

  async function saveEditTitle(taskId: string) {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== tasks.find((t) => t.id === taskId)?.title) {
      await updateTask(taskId, ideaId, { title: trimmed });
    }
    setEditingTaskId(null);
  }

  async function handleDelete(taskId: string) {
    setConfirmDeleteId(null);
    await deleteTask(taskId, ideaId);
  }

  return (
    <div className="glass-card rounded-2xl p-6 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold tracking-tight text-white">
          Tracker
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
        {["ALL", ...TASK_STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-default ${
              filter === s
                ? "bg-white/12 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {s === "ALL" ? "All" : TASK_STATUS_LABELS[s as TaskStatus]}
          </button>
        ))}
      </div>

      {/* Add task */}
      <form
        ref={formRef}
        action={handleAddTask}
        className="flex items-center gap-2 mb-4"
      >
        <input
          type="text"
          name="title"
          required
          maxLength={200}
          placeholder="Add a task..."
          className="flex-1 bg-[#151a26]/90 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-emerald-500/50 transition-default tracking-tight"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold transition-default active:scale-[0.95] shadow-sm cursor-pointer"
        >
          <Plus weight="bold" className="w-4 h-4" />
        </button>
      </form>

      {/* Task list */}
      <div className="space-y-1.5">
        {filteredTasks.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6 font-medium">
            {filter === "ALL" ? "No tasks yet" : `No ${TASK_STATUS_LABELS[filter as TaskStatus]?.toLowerCase()} tasks`}
          </p>
        )}

        {filteredTasks.map((task) => {
          const StatusIcon = STATUS_ICONS[task.status] || Circle;
          const statusColor = STATUS_COLORS[task.status] || "text-slate-400";
          const isExpanded = expandedTask === task.id;
          const isEditing = editingTaskId === task.id;
          const isConfirmingDelete = confirmDeleteId === task.id;
          const completedLabel = formatCompletedDate(task.completedAt);

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
                  className={`shrink-0 transition-default hover:scale-115 ${statusColor}`}
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
                      className="p-0.5 rounded text-emerald-400 hover:bg-emerald-500/20 transition-default"
                    >
                      <Check weight="bold" className="w-3.5 h-3.5" />
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

                {/* Completed timestamp */}
                {completedLabel && (
                  <span className="text-[9px] font-mono text-emerald-500/70 tracking-wider hidden sm:block">
                    ✓ {completedLabel}
                  </span>
                )}

                {/* Priority indicator */}
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border tracking-wider font-bold ${
                    task.priority === "HIGH"
                      ? "text-rose-400 bg-rose-950/40 border-rose-500/35 shadow-[0_0_8px_rgba(244,63,94,0.25)]"
                      : task.priority === "MEDIUM"
                        ? "text-amber-400 bg-amber-950/40 border-amber-500/35 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
                        : "text-slate-400 bg-slate-900/40 border-slate-700/40"
                  }`}
                >
                  {task.priority[0]}
                </span>

                {/* Expand */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTask(isExpanded ? null : task.id)
                  }
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-default"
                >
                  <CaretDown
                    weight="bold"
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Delete with confirmation */}
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-default"
                      title="Confirm delete"
                    >
                      <Check weight="bold" className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="p-1 rounded text-slate-400 hover:bg-white/10 transition-default"
                      title="Cancel"
                    >
                      <X weight="bold" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(task.id)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-default"
                  >
                    <Trash weight="bold" className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-9 pb-3 space-y-2 animate-in">
                  {/* Priority selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold w-14">
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
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold transition-default ${
                            task.priority === p
                              ? `priority-${p.toLowerCase()} bg-white/15 border border-white/20`
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {PRIORITY_LABELS[p]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold w-14">
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
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold transition-default ${
                            task.status === s
                              ? "text-white bg-white/15 border border-white/20"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {TASK_STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Edit title button */}
                  {!isEditing && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold w-14">
                        Title
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditing(task)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold text-slate-400 hover:text-white transition-default"
                      >
                        <PencilSimple weight="bold" className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
