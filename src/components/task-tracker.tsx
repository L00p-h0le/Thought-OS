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
} from "@phosphor-icons/react";

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  sortOrder: number;
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
  TODO: "text-muted",
  IN_PROGRESS: "text-yellow-400",
  DONE: "text-accent",
};

function nextStatus(current: string): string {
  const order = ["TODO", "IN_PROGRESS", "DONE"];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

export function TaskTracker({ ideaId, tasks }: TaskTrackerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const progress = tasks.length > 0 ? (doneTasks / tasks.length) * 100 : 0;

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

  async function handleDelete(taskId: string) {
    await deleteTask(taskId, ideaId);
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-tight">Tracker</h2>
        <span className="text-xs font-mono text-muted">
          {doneTasks}/{tasks.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-surface-active rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-surface-hover/50 rounded-lg p-1">
        {["ALL", ...TASK_STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`flex-1 px-2 py-1.5 rounded-md text-[11px] font-mono transition-default ${
              filter === s
                ? "bg-surface-active text-foreground"
                : "text-muted hover:text-foreground"
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
          placeholder="Add a task..."
          className="flex-1 bg-surface-hover/50 border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted/30 outline-none focus:border-accent/30 transition-default"
        />
        <button
          type="submit"
          className="p-2 rounded-lg bg-surface-hover hover:bg-surface-active transition-default active:scale-[0.95]"
        >
          <Plus weight="bold" className="w-4 h-4 text-muted" />
        </button>
      </form>

      {/* Task list */}
      <div className="space-y-1">
        {filteredTasks.length === 0 && (
          <p className="text-xs text-muted/40 text-center py-6">
            {filter === "ALL" ? "No tasks yet" : `No ${TASK_STATUS_LABELS[filter as TaskStatus]?.toLowerCase()} tasks`}
          </p>
        )}

        {filteredTasks.map((task) => {
          const StatusIcon = STATUS_ICONS[task.status] || Circle;
          const statusColor = STATUS_COLORS[task.status] || "text-muted";
          const isExpanded = expandedTask === task.id;

          return (
            <div
              key={task.id}
              className="group rounded-lg hover:bg-surface-hover/50 transition-default"
            >
              <div className="flex items-center gap-2.5 px-2 py-2">
                {/* Status toggle */}
                <button
                  type="button"
                  onClick={() => cycleStatus(task)}
                  className={`shrink-0 transition-default hover:scale-110 ${statusColor}`}
                  title={`Status: ${task.status}. Click to cycle.`}
                >
                  <StatusIcon
                    weight={task.status === "DONE" ? "fill" : "regular"}
                    className="w-4.5 h-4.5"
                  />
                </button>

                {/* Title */}
                <span
                  className={`flex-1 text-sm truncate ${
                    task.status === "DONE"
                      ? "line-through text-muted/50"
                      : "text-foreground"
                  }`}
                >
                  {task.title}
                </span>

                {/* Priority indicator */}
                <span
                  className={`text-[9px] font-mono uppercase priority-${task.priority.toLowerCase()} opacity-60`}
                >
                  {task.priority[0]}
                </span>

                {/* Expand */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTask(isExpanded ? null : task.id)
                  }
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-surface-active transition-default"
                >
                  <CaretDown
                    weight="bold"
                    className={`w-3 h-3 text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-danger-muted transition-default"
                >
                  <Trash weight="regular" className="w-3 h-3 text-danger" />
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-9 pb-3 space-y-2 animate-in">
                  {/* Priority selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted uppercase w-14">
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
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-default ${
                            task.priority === p
                              ? `priority-${p.toLowerCase()} bg-surface-active`
                              : "text-muted/50 hover:text-muted"
                          }`}
                        >
                          {PRIORITY_LABELS[p]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted uppercase w-14">
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
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-default ${
                            task.status === s
                              ? "text-foreground bg-surface-active"
                              : "text-muted/50 hover:text-muted"
                          }`}
                        >
                          {TASK_STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
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
