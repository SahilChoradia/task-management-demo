from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from app.database import init_db
from app.routes.task import router as task_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Mini Task Management API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task_router, prefix="/api/tasks")


@app.get("/", include_in_schema=False)
async def root() -> JSONResponse:
    """Avoid 404 when opening the API base URL in a browser."""
    return JSONResponse(
        {
            "service": "Mini Task Management API",
            "docs": "/docs",
            "openapi": "/openapi.json",
            "health": "/health",
            "tasks": "/api/tasks/",
        }
    )


@app.get("/favicon.ico", include_in_schema=False)
async def favicon() -> Response:
    """Browsers request this automatically; return empty so logs stay clean."""
    return Response(status_code=204)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
