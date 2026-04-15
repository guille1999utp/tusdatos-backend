from sqlalchemy import or_
from sqlalchemy.orm import Session
from fastapi import HTTPException
from schemas.main import UserCreate, UserLogin, UserRolUpdate
from models.user import User
from models.roles import UserRoleEnum
from passlib.context import CryptContext
from core.security import create_access_token
from core.permissions import is_admin

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def register_user(db: Session, user: UserCreate):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)

    # Rol global: solo `usuario`, salvo primer usuario en BD que puede ser `admin` (bootstrap / tests).
    count = db.query(User).count()
    if count == 0 and user.role == UserRoleEnum.admin.value:
        role = UserRoleEnum.admin
    else:
        role = UserRoleEnum.usuario

    db_user = User(email=user.email, hashed_password=hashed_password, name=user.name, role=role)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    token = create_access_token(data={"sub": db_user.email, "role": db_user.role})

    return {
        "msg": "User created successfully",
        "access_token": token,
        "user": {
            "email": db_user.email,
            "role": db_user.role,
            "name": db_user.name,
        },
    }


def login_user(db: Session, user: UserLogin):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": db_user.email, "role": db_user.role})
    return {"access_token": token, "user": {"email": db_user.email, "role": db_user.role, "name": db_user.name}}


def update_role(db: Session, user_id: int, user: UserRolUpdate, current_user: User):
    actor = db.query(User).filter(User.id == current_user.id).first()
    if not actor or actor.role != UserRoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not authorized to update role")

    if user.role not in {UserRoleEnum.admin.value, UserRoleEnum.usuario.value}:
        raise HTTPException(status_code=400, detail="Invalid role")

    user_to_update = db.query(User).filter(User.id == user_id).first()
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")

    new_role = UserRoleEnum(user.role)

    if new_role == UserRoleEnum.usuario and user_to_update.role == UserRoleEnum.admin:
        other_admin = (
            db.query(User)
            .filter(User.role == UserRoleEnum.admin, User.id != user_id)
            .first()
        )
        if not other_admin:
            raise HTTPException(
                status_code=400,
                detail="Debe existir al menos un administrador. Promueve a otro usuario a admin antes de degradar a este.",
            )

    # Solo puede existir un admin global: al promover a otro, el anterior pasa a usuario.
    if new_role == UserRoleEnum.admin:
        other_admin = db.query(User).filter(User.role == UserRoleEnum.admin, User.id != user_id).first()
        if other_admin:
            other_admin.role = UserRoleEnum.usuario
            db.add(other_admin)

    user_to_update.role = new_role
    db.commit()
    db.refresh(user_to_update)

    me = db.query(User).filter(User.id == actor.id).first()
    logout_required = me is None or me.role != UserRoleEnum.admin

    return {
        "msg": "User role updated successfully",
        "logout_required": logout_required,
    }


def list_users(db: Session, current_user: User):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Solo administradores pueden listar usuarios")
    users = db.query(User).all()
    users = [user for user in users if user.id != current_user.id]
    return users


def search_users(
    db: Session,
    current_user: User,
    q: str = "",
    skip: int = 0,
    limit: int = 10,
):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Solo administradores pueden buscar usuarios")
    query = db.query(User)
    if q.strip():
        pattern = f"%{q.strip()}%"
        query = query.filter(or_(User.name.ilike(pattern), User.email.ilike(pattern)))
    total = query.count()
    items = query.order_by(User.id).offset(skip).limit(limit).all()
    return {"items": items, "total": total}


def list_roles():
    return UserRoleEnum.list_roles()


def get_user_by_id(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def delete_user(db: Session, user_id: int, current_user: User):
    if not is_admin(current_user):
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden eliminar usuarios",
        )
    if user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="No puedes eliminar tu propia cuenta",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == UserRoleEnum.admin:
        admin_count = db.query(User).filter(User.role == UserRoleEnum.admin).count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="No se puede eliminar el único administrador del sistema.",
            )
    db.delete(user)
    db.commit()
    return {"msg": "Usuario eliminado correctamente"}
