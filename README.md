# Mini Task Management Tool

Monorepo: **FastAPI** + **SQLAlchemy (async)** + **SQLite** backend, **Next.js 14 (App Router)** + **TypeScript** + **Tailwind** frontend.

## Prerequisites

- Python 3.10+ with `pip`
- Node.js 18+ with `npm`

## Backend setup

On Windows, if `pip` is not recognized, use **`python -m pip`** (Python’s install folder is often on PATH even when the `Scripts` folder is not).

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Shortest from `backend` on **port 8080** (default in `dev.cmd`):

```powershell
.\dev.cmd
```

Other port: `.\dev.cmd 8000`. Uvicorn already binds to `127.0.0.1` by default.

**PowerShell helper** (same folder as `requirements.txt`):

```powershell
.\run_dev.ps1              # port 8000
.\run_dev.ps1 -Port 8080   # if 8000 is blocked (see below)
```

If scripts are disabled: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` (once), or run the `python -m uvicorn ...` line directly.

If `python` is not recognized, install Python from [python.org](https://www.python.org/downloads/) and tick **“Add python.exe to PATH”**.  
**Python 3.14+:** use the `requirements.txt` in this repo (newer `pydantic` so wheels exist). For older pins, prefer **Python 3.12** if installs fail.

**Optional:** so `pip` and `uvicorn` work without `python -m`, add your Python **Scripts** folder to PATH (pip warns with the exact path), e.g.  
`%LocalAppData%\Python\pythoncore-3.14-64\Scripts`.

### `No module named uvicorn` (or tasks never create / always fail)

You likely have **more than one Python** on Windows (e.g. `...\Python314\python.exe` from python.org **and** another under `%LocalAppData%\Python\...`). Packages install into **whichever** `python` you used — the other copy won’t see them.

**Fix:** use the **same** interpreter for install and run:

```powershell
cd D:\internship-project\backend
# See which python runs:
where.exe python
python --version

python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

If `python -m uvicorn` still fails, install with the **full path** to the `.exe` you intend to use, then run with that same path:

```powershell
& "C:\Users\DELL G3 GAMING\AppData\Local\Programs\Python\Python314\python.exe" -m pip install -r requirements.txt
cd D:\internship-project\backend
& "C:\Users\DELL G3 GAMING\AppData\Local\Programs\Python\Python314\python.exe" -m uvicorn app.main:app --reload --port 8000
```

**Why tasks don’t create:** the **API must be running** on the URL in `frontend/.env.local` (default `http://localhost:8000`). If uvicorn isn’t running or the port is wrong, the UI will show an error and POST `/api/tasks/` never succeeds.

API: [http://localhost:8000](http://localhost:8000)  
Docs: [http://localhost:8000/docs](http://localhost:8000/docs)  
SQLite file: `backend/tasks.db` (created on first start)

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

Optional: copy `frontend/.env.example` to `frontend/.env.local` and adjust `NEXT_PUBLIC_API_URL` if the API is not on `http://localhost:8000`.

### Windows: `WinError 10013` (socket access forbidden)

Usually **port 8000 is in use** or **reserved** (Hyper-V / WSL / excluded ranges).

1. **Use another port** (simplest):

   ```powershell
   cd backend
   python -m uvicorn app.main:app --reload --port 8080
   ```

   In `frontend/.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8080
   ```

   Restart `npm run dev` after changing `.env.local`.

2. **See what owns port 8000** (PowerShell as admin optional):

   ```powershell
   netstat -ano | findstr :8000
   ```

3. **Check excluded TCP ranges** (if 8000 falls inside, pick a port outside them, e.g. 8080 or 9000):

   ```powershell
   netsh interface ipv4 show excludedportrange protocol=tcp
   ```

## API

**Interactive docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (with backend running)

**Copy-paste URLs & cURL:** see [`docs/API.md`](docs/API.md).

Base path: `/api/tasks`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/tasks/` | Create task |
| GET | `/api/tasks/` | List tasks (`?status=pending` optional) |
| GET | `/api/tasks/{id}` | Get one task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

## Deploy (Vercel + Render)

Step-by-step guide: **[`docs/DEPLOY_RENDER_VERCEL.md`](docs/DEPLOY_RENDER_VERCEL.md)**  
**Production API (Render):** [`https://task-management-demo-1dhc.onrender.com`](https://task-management-demo-1dhc.onrender.com) — set in **`frontend/.env.production`** for Vercel builds.  
**Render start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`  
On Render, set **`CORS_ORIGINS`** to your Vercel `https://` URLs (comma-separated).

## Project layout

```
/backend
  /app
    main.py
    database.py
    models.py
    schemas.py
    crud.py
    /routes
      task.py
  requirements.txt
/frontend
  /app
    page.tsx
    layout.tsx
    globals.css
  /components
    TaskForm.tsx
    TaskList.tsx
    TaskItem.tsx
  /lib
    api.ts
  package.json
```
