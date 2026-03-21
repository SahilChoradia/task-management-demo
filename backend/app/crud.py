import uuid
from typing import Sequence

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Task, TaskStatus
from app.schemas import TaskCreate, TaskUpdate


async def create_task(db: AsyncSession, task_in: TaskCreate) -> Task:
    task = Task(
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,
        priority=task_in.priority,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


async def get_tasks(
    db: AsyncSession,
    *,
    status_filter: TaskStatus | None = None,
) -> Sequence[Task]:
    stmt = select(Task).order_by(Task.created_at.desc())
    if status_filter is not None:
        stmt = stmt.where(Task.status == status_filter)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_task(db: AsyncSession, task_id: uuid.UUID) -> Task | None:
    result = await db.execute(select(Task).where(Task.id == str(task_id)))
    return result.scalar_one_or_none()


async def update_task(
    db: AsyncSession,
    task_id: uuid.UUID,
    task_in: TaskUpdate,
) -> Task | None:
    task = await get_task(db, task_id)
    if task is None:
        return None

    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    await db.commit()
    await db.refresh(task)
    return task


async def delete_task(db: AsyncSession, task_id: uuid.UUID) -> bool:
    sid = str(task_id)
    result = await db.execute(delete(Task).where(Task.id == sid))
    await db.commit()
    return (result.rowcount or 0) > 0
