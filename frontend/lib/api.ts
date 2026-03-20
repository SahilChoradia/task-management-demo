export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

export interface TaskCreatePayload {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body?: string;

  constructor(message: string, status: number, body?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function tasksBaseUrl(): string {
  return `${API_ORIGIN.replace(/\/$/, "")}/api/tasks`;
}

async function parseErrorDetail(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const data = JSON.parse(text) as { detail?: unknown };
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((d) =>
          typeof d === "object" && d !== null && "msg" in d
            ? String((d as { msg: string }).msg)
            : JSON.stringify(d),
        )
        .join("; ");
    }
    if (data.detail !== undefined) return JSON.stringify(data.detail);
  } catch {
  }
  return text || res.statusText || "Request failed";
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const detail = await parseErrorDetail(res);
    throw new ApiError(detail, res.status);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export type StatusFilter = TaskStatus | "all";

export async function fetchTasks(
  statusFilter: StatusFilter = "all",
): Promise<Task[]> {
  const base = tasksBaseUrl();
  const url =
    statusFilter !== "all"
      ? `${base}/?status=${encodeURIComponent(statusFilter)}`
      : `${base}/`;
  const res = await fetch(url, { cache: "no-store" });
  return handleJson<Task[]>(res);
}

export async function createTask(
  payload: TaskCreatePayload,
): Promise<Task> {
  const res = await fetch(`${tasksBaseUrl()}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson<Task>(res);
}

export async function updateTask(
  id: string,
  payload: TaskUpdatePayload,
): Promise<Task> {
  const res = await fetch(`${tasksBaseUrl()}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson<Task>(res);
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${tasksBaseUrl()}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  await handleJson<{ deleted?: boolean }>(res);
}
