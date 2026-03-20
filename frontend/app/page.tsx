"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import {
  API_ORIGIN,
  ApiError,
  type StatusFilter,
  type Task,
  type TaskPriority,
  type TaskStatus,
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from "@/lib/api";

export default function DashboardPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchTasks("all");
      setAllTasks(data);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else if (e instanceof TypeError) {
        setError(
          `Cannot reach API at ${API_ORIGIN}. Start the backend and set NEXT_PUBLIC_API_URL in .env.local to the same host:port as uvicorn (e.g. http://127.0.0.1:8080). Restart npm run dev after editing .env.local.`,
        );
      } else {
        setError("Failed to load tasks");
      }
      setAllTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const visibleTasks = useMemo(() => {
    if (statusFilter === "all") return allTasks;
    return allTasks.filter((t) => t.status === statusFilter);
  }, [allTasks, statusFilter]);

  const summary = useMemo(() => {
    const total = allTasks.length;
    const pending = allTasks.filter((t) => t.status === "pending").length;
    const completed = allTasks.filter((t) => t.status === "completed").length;
    return { total, pending, completed };
  }, [allTasks]);

  async function handleCreate(data: {
    title: string;
    description: string;
    priority: TaskPriority;
  }) {
    setError(null);
    setActionBusy(true);
    try {
      await createTask({
        title: data.title,
        description: data.description || null,
        priority: data.priority,
      });
      await loadTasks();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not create task");
      throw e;
    } finally {
      setActionBusy(false);
    }
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    setError(null);
    setActionBusy(true);
    try {
      await updateTask(id, { status });
      await loadTasks();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not update status");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setActionBusy(true);
    try {
      await deleteTask(id);
      await loadTasks();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not delete task");
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Task dashboard
        </h1>
        <p className="mt-1 text-slate-600">
          Manage tasks with your local FastAPI backend.
        </p>
      </header>

      {error && (
        <div
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label
            htmlFor="filter-status"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Filter by status
          </label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as StatusFilter)
            }
            disabled={actionBusy}
            className="w-full min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 sm:w-auto"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <SummaryPill label="Total" value={summary.total} accent="slate" />
          <SummaryPill label="Pending" value={summary.pending} accent="gray" />
          <SummaryPill
            label="Completed"
            value={summary.completed}
            accent="green"
          />
        </div>
      </div>

      <div className="mb-10">
        <TaskForm onSubmit={handleCreate} disabled={actionBusy} />
      </div>

      <section aria-label="Tasks">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Tasks</h2>
        <TaskList
          tasks={visibleTasks}
          loading={loading}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          busy={actionBusy}
        />
      </section>
    </main>
  );
}

function SummaryPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "slate" | "gray" | "green";
}) {
  const styles = {
    slate: "border-slate-200 bg-slate-100 text-slate-800",
    gray: "border-slate-200 bg-slate-50 text-slate-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
  }[accent];

  return (
    <div
      className={`rounded-lg border px-3 py-2 ${styles}`}
      title={`${label}: ${value}`}
    >
      <span className="font-medium">{label}</span>
      <span className="ml-2 tabular-nums text-lg font-semibold">{value}</span>
    </div>
  );
}
