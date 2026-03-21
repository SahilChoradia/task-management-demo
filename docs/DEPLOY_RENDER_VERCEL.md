# Deploy backend (Render) + frontend (Vercel)

## 1. Deploy FastAPI on Render

### Repo layout

This monorepo keeps the API in the **`backend/`** folder.

### Steps in the Render dashboard

1. **New → Web Service** → connect your GitHub/GitLab repo.
2. **Root Directory:** `backend`  
   (Render runs build/start from here.)
3. **Runtime:** `Python 3` (pick **3.11+** in Environment if needed).
4. **Build Command:**

   ```bash
   pip install -r requirements.txt
   ```

5. **Start Command** (copy-paste exactly):

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

   Render injects **`PORT`**; binding to **`0.0.0.0`** is required so the service is reachable.

6. **Instance type:** Free tier is fine for demos.

7. **Environment variables** (Render → your service → **Environment**) — usually **skip**:

   - **`https://<anything>.vercel.app`** (production or preview) is already allowed by the API’s CORS regex — **no `CORS_ORIGINS` needed** if you only use Vercel’s default URLs.
   - Set **`CORS_ORIGINS`** only if you add a **custom domain** (e.g. `https://www.yourdomain.com`), comma-separated, **no spaces**.

   Local dev (`http://localhost:3000`, etc.) stays allowed by default.

   After changing CORS-related code, **redeploy** the Render service.

8. Click **Create Web Service** and wait for the first deploy. Note the service URL.

   This repo’s production frontend is wired to:

   **`https://task-management-demo-1dhc.onrender.com`**

   via `frontend/.env.production`. Change that file if you use a different Render service.

### Health check (optional)

Use path **`/health`** in Render’s health check settings if you add one.

---

## 2. Point Vercel at Render

In **Vercel** → your project → **Settings → Environment Variables**:

| Name | Value | Environments |
|------|--------|----------------|
| `NEXT_PUBLIC_API_URL` | `https://task-management-demo-1dhc.onrender.com` | Production, Preview |

You can rely on committed **`frontend/.env.production`** instead of Vercel env vars, or override in Vercel if you prefer. URL **without** trailing slash.

Redeploy the frontend (or trigger a new deployment) so the variable is applied.

---

## 3. SQLite on Render (important)

On Render’s **free** Web Service, the filesystem is **ephemeral**: redeploys or restarts can **wipe** `tasks.db`.

- **Demos / class projects:** SQLite is OK if you accept that data may reset.
- **Real production:** use **Render PostgreSQL** (or another hosted DB) and switch the app from SQLite to Postgres.

---

## 4. Quick checklist

- [ ] Render **Root Directory** = `backend`
- [ ] Start command uses **`0.0.0.0`** and **`$PORT`**
- [ ] **`CORS_ORIGINS`** includes your exact Vercel URLs (`https://…`)
- [ ] Vercel **`NEXT_PUBLIC_API_URL`** = Render service URL
- [ ] Redeploy Vercel after changing env vars

---

## 5. Manual smoke test

After deploy:

```bash
curl https://your-api.onrender.com/health
curl https://your-api.onrender.com/api/tasks/
```

From the browser on Vercel, open DevTools → Network and confirm API calls go to your Render URL and return **200**.
