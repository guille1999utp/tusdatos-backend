from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.main import UserCreate, UserLogin, UserResponse, UpdateResponse, UserRolUpdate, GlobalUserRole, PaginatedUsers
from database.main import get_db
from controllers.auth import (
    register_user,
    login_user,
    list_users,
    update_role,
    list_roles,
    search_users,
    delete_user,
)
from models.user import User
from core.security import get_current_user

from typing import List
router = APIRouter()

@router.post("/register", response_model=dict)
def register_user_endpoint(user: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, user)

@router.get("/list/users", response_model=List[UserResponse])
def list_users_endpoint(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return list_users(db, current_user)


@router.get("/users/search", response_model=PaginatedUsers)
def search_users_endpoint(
    q: str = "",
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return search_users(db, current_user, q=q, skip=skip, limit=limit)

@router.get("/list/roles", response_model=List[GlobalUserRole])
def list_roles_endpoint():
    return list_roles()

@router.post("/login", response_model=dict)
def login_user_endpoint(user: UserLogin, db: Session = Depends(get_db)):
    return login_user(db, user)

@router.put("/role/{user_id}", response_model=UpdateResponse)
def update_role_endpoint(
    user_id: int,
    user: UserRolUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_role(db, user_id, user, current_user)


@router.delete("/users/{user_id}")
def delete_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_user(db, user_id, current_user)