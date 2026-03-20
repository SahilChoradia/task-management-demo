"use client";

import { useState } from "react";
import type { Task, TaskStatus } from "@/lib/api";

const statusStyles: Record<
  TaskStatus,
  { label: string; dot: string; ring: string }
> = {
  pending: {
    label: "Pending",
    dot: "bg-slate-400",
    ring: "ring-slate-300",
  },
  in_progress: {
    label: "In progress",
    dot: "bg-amber-400",
    ring: "ring-amber-200",
  },
  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
};

const priorityLabel: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

type TaskItemProps = {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  busy?: boolean;
};

export function TaskItem({
  task,
  onStatusChange,
  onDelete,
  busy,
}: TaskItemProps) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const styles = statusStyles[task.status];

  async function handleStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as TaskStatus;
    if (next === task.status || busy || updating) return;
    setUpdating(true);
    try {
      await onStatusChange(task.id, next);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (busy || deleting) return;
    if (!window.confirm("Delete this task?")) return;
    setDeleting(true);
    try {
      // Ensure string UUID (API should send string; coerce for safety)
      await onDelete(String(task.id));
    } finally {
      setDeleting(false);
    }
  }

  const disabled = Boolean(busy || updating || deleting);

  return (
    <article
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-2 ring-transparent transition ${styles.ring}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`}
              title={styles.label}
              aria-hidden
            />
            <h3 className="truncate text-base font-semibold text-slate-900">
              {task.title}
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {priorityLabel[task.priority] ?? task.priority}
            </span>
          </div>
          {task.description ? (
            <p className="whitespace-pre-wrap text-sm text-slate-600">
              {task.description}
            </p>
          ) : (
            <p className="text-sm italic text-slate-400">No description</p>
          )}
          <p className="mt-2 text-xs text-slate-400">
            Updated{" "}
            {new Date(task.updated_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:w-48">
          <label className="text-xs font-medium text-slate-500" htmlFor={`status-${task.id}`}>
            Status
          </label>
          <select
            id={`status-${task.id}`}
            value={task.status}
            onChange={handleStatus}
            disabled={disabled}
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <button
            type="button"
            onClick={handleDelete}
            disabled={disabled}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}
