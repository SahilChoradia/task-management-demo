"use client";

import { FormEvent, useState } from "react";
import type { TaskPriority } from "@/lib/api";

type TaskFormProps = {
  onSubmit: (data: {
    title: string;
    description: string;
    priority: TaskPriority;
  }) => Promise<void>;
  disabled?: boolean;
};

export function TaskForm({ onSubmit, disabled }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || disabled || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: trimmed,
        description: description.trim() || "",
        priority,
      });
      setTitle("");
      setDescription("");
      setPriority("medium");
    } catch {
      /* parent handles / displays error */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        Add task
      </h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="task-title"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:border-slate-400 focus:ring-2"
            disabled={disabled || submitting}
            required
            maxLength={255}
          />
        </div>
        <div>
          <label
            htmlFor="task-description"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details"
            rows={3}
            className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:border-slate-400 focus:ring-2"
            disabled={disabled || submitting}
          />
        </div>
        <div>
          <label
            htmlFor="task-priority"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
            disabled={disabled || submitting}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={disabled || submitting || !title.trim()}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitting ? "Adding…" : "Add task"}
        </button>
      </div>
    </form>
  );
}
