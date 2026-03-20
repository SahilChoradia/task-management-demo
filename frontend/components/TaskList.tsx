"use client";

import type { Task, TaskStatus } from "@/lib/api";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: Task[];
  loading: boolean;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  busy?: boolean;
};

export function TaskList({
  tasks,
  loading,
  onStatusChange,
  onDelete,
  busy,
}: TaskListProps) {
  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-slate-500">
        Loading tasks…
      </div>
    );
  }

  if (!loading && tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
        No tasks yet. Add one above.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {loading && tasks.length > 0 && (
        <p className="text-center text-sm text-slate-500">Refreshing…</p>
      )}
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskItem
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              busy={busy}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
