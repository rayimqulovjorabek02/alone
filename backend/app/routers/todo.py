"""
backend/app/routers/todo.py
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.jwt import get_current_user
from database import get_db

router = APIRouter()


class TodoCreate(BaseModel):
    title:    str
    priority: str = "normal"
    due_date: Optional[str] = None


class TodoUpdate(BaseModel):
    title:    Optional[str]  = None
    done:     Optional[bool] = None
    priority: Optional[str]  = None
    due_date: Optional[str]  = None


@router.get("")
async def get_todos(current: dict = Depends(get_current_user)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM todos WHERE user_id=? ORDER BY created_at DESC",
            (current["user_id"],)
        ).fetchall()
    return [dict(r) for r in rows]


@router.post("")
async def create_todo(body: TodoCreate, current: dict = Depends(get_current_user)):
    if not body.title.strip():
        raise HTTPException(400, "Sarlavha kerak")
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO todos (user_id, title, priority, due_date) VALUES (?,?,?,?)",
            (current["user_id"], body.title.strip(), body.priority, body.due_date)
        )
    return {"id": cur.lastrowid, "success": True}


@router.put("/{todo_id}")
async def update_todo(todo_id: int, body: TodoUpdate, current: dict = Depends(get_current_user)):
    updates = body.dict(exclude_none=True)
    if not updates:
        raise HTTPException(400, "O'zgartirish kerak")
    if "done" in updates:
        updates["done"] = 1 if updates["done"] else 0
    with get_db() as conn:
        sets = ", ".join(f"{k}=?" for k in updates)
        conn.execute(
            f"UPDATE todos SET {sets} WHERE id=? AND user_id=?",
            (*updates.values(), todo_id, current["user_id"])
        )
    return {"success": True}


@router.delete("/{todo_id}")
async def delete_todo(todo_id: int, current: dict = Depends(get_current_user)):
    with get_db() as conn:
        conn.execute("DELETE FROM todos WHERE id=? AND user_id=?", (todo_id, current["user_id"]))
    return {"success": True}