# Task REST API

**Base URL (local default):** `http://127.0.0.1:8000` or `http://localhost:8000`  
**Tasks prefix:** `/api/tasks`

Replace `BASE` and `TASK_ID` in the examples below.

---

## Links (browser)

| Action        | URL (after starting uvicorn) |
|---------------|------------------------------|
| Swagger UI    | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) |
| OpenAPI JSON  | [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json) |
| Health        | [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) |
| List tasks    | [http://127.0.0.1:8000/api/tasks/](http://127.0.0.1:8000/api/tasks/) |
| Filter (pending) | `http://127.0.0.1:8000/api/tasks/?status=pending` |

Single-task URLs need a real UUID from a create/list response, e.g.  
`http://127.0.0.1:8000/api/tasks/550e8400-e29b-41d4-a716-446655440000`

---

## cURL (PowerShell / CMD)

Set once:

```powershell
$BASE = "http://127.0.0.1:8000"
```

### 1. Create task

```powershell
curl -X POST "$BASE/api/tasks/" -H "Content-Type: application/json" -d "{\"title\":\"My task\",\"description\":\"Optional\",\"priority\":\"medium\",\"status\":\"pending\"}"
```

### 2. Get all tasks

```powershell
curl "$BASE/api/tasks/"
```

Optional filter:

```powershell
curl "$BASE/api/tasks/?status=completed"
```

### 3. Get single task

```powershell
$TASK_ID = "PASTE-UUID-HERE"
curl "$BASE/api/tasks/$TASK_ID"
```

### 4. Update task

```powershell
$TASK_ID = "PASTE-UUID-HERE"
curl -X PUT "$BASE/api/tasks/$TASK_ID" -H "Content-Type: application/json" -d "{\"status\":\"completed\"}"
```

### 5. Delete task

```powershell
$TASK_ID = "PASTE-UUID-HERE"
curl -X DELETE "$BASE/api/tasks/$TASK_ID"
```

---

## Endpoint summary

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/tasks/` | Create task |
| `GET` | `/api/tasks/` | List all (optional `?status=pending\|in_progress\|completed`) |
| `GET` | `/api/tasks/{id}` | Get one |
| `PUT` | `/api/tasks/{id}` | Update fields (partial OK) |
| `DELETE` | `/api/tasks/{id}` | Delete (returns `{"deleted":true,"id":"..."}`) |

**Status values:** `pending`, `in_progress`, `completed`  
**Priority values:** `low`, `medium`, `high`

If your API runs on another port (e.g. `8080`), change `BASE` and set `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.
