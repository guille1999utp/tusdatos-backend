from datetime import date as date_cls

from sqlalchemy import exists, func, or_
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.event import Event, EventRegistration, EventSession
from models.roles import EventRegistrationRoleEnum, UserRoleEnum
from models.user import User
from schemas.main import (
    EventCreate,
    EventUpdate,
    EventResponse,
    EventSessionCreate,
    EventRegistrationAssignBody,
    EventRegistrationRoleUpdate,
    EventOrganizerTransfer,
)
from typing import Dict, List, Optional, Tuple

from core.permissions import (
    can_create_event,
    can_edit_or_delete_event,
    can_manage_event_staff,
    can_transfer_event_organizer,
    is_admin,
    is_event_asistente,
    is_event_creator,
)


def _attendee_count(event: Event) -> int:
    """Participantes (rol usuario) que cuentan para aforo: no organizador ni asistente; excluye admins globales."""
    n = 0
    for r in event.registrations:
        if r.role != EventRegistrationRoleEnum.usuario:
            continue
        u = r.user
        if u is None or u.role == UserRoleEnum.admin:
            continue
        n += 1
    return n


def _usuario_attendee_count_db(db: Session, event_id: int) -> int:
    return (
        db.query(EventRegistration)
        .join(User, EventRegistration.user_id == User.id)
        .filter(
            EventRegistration.event_id == event_id,
            EventRegistration.role == EventRegistrationRoleEnum.usuario,
            User.role != UserRoleEnum.admin,
        )
        .count()
    )


def _assert_registration_role_transition(
    db: Session,
    event: Event,
    actor: User,
    target_user_id: int,
    old_role: Optional[EventRegistrationRoleEnum],
    new_role: EventRegistrationRoleEnum,
) -> None:
    """Quién puede fijar rol: admin/organizador libre; asistente alta como usuario, promover usuario→asistente, o abandonar su propio rol asistente→usuario."""
    if is_admin(actor) or is_event_creator(actor, event):
        return
    if is_event_asistente(db, actor, event.id):
        if old_role is None:
            if new_role != EventRegistrationRoleEnum.usuario:
                raise HTTPException(
                    status_code=403,
                    detail="Los asistentes solo pueden añadir participantes con rol usuario.",
                )
            return
        if old_role == new_role:
            return
        if old_role == EventRegistrationRoleEnum.usuario and new_role == EventRegistrationRoleEnum.asistente:
            return
        if (
            old_role == EventRegistrationRoleEnum.asistente
            and new_role == EventRegistrationRoleEnum.usuario
            and target_user_id == actor.id
        ):
            return
        raise HTTPException(
            status_code=403,
            detail="Los asistentes solo pueden promover participantes a asistente o abandonar su propio rol de asistente.",
        )
    raise HTTPException(status_code=403, detail="No autorizado para cambiar roles en este evento.")


def _check_capacity_usuario_if_needed(
    db: Session,
    event: Event,
    old_role: Optional[EventRegistrationRoleEnum],
    new_role: EventRegistrationRoleEnum,
) -> None:
    """Al pasar a participante (usuario), respeta capacidad (incl. asistente → usuario)."""
    if new_role != EventRegistrationRoleEnum.usuario:
        return
    if old_role == EventRegistrationRoleEnum.usuario:
        return
    if old_role is None:
        if _usuario_attendee_count_db(db, event.id) >= event.capacity:
            raise HTTPException(status_code=400, detail="El evento ha alcanzado su capacidad máxima.")
        return
    if _usuario_attendee_count_db(db, event.id) + 1 > event.capacity:
        raise HTTPException(status_code=400, detail="El evento ha alcanzado su capacidad máxima.")


def _serialize_event_list_item(db: Session, event: Event, viewer: Optional[User] = None) -> dict:
    """Incluye conteo de participantes (rol usuario) y, si aplica, el rol del viewer en el evento."""
    reg_count = _attendee_count(event)
    role: Optional[str] = None
    if viewer is not None:
        if event.created_by == viewer.id:
            role = "organizador"
        else:
            mi = (
                db.query(EventRegistration)
                .filter(
                    EventRegistration.event_id == event.id,
                    EventRegistration.user_id == viewer.id,
                )
                .first()
            )
            if mi:
                role = mi.role.value
    return {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "capacity": event.capacity,
        "date": event.date,
        "state": event.state,
        "registered_count": reg_count,
        "role": role,
    }


def _total_inscritos_por_eventos(db: Session, events: List[Event]) -> Dict[int, int]:
    """Solo participantes con rol inscripción «usuario» (quienes ingresan al aforo); sin organizador, asistentes ni admins globales."""
    if not events:
        return {}
    event_ids = [e.id for e in events]
    rows = (
        db.query(EventRegistration.event_id, func.count(EventRegistration.id))
        .join(User, EventRegistration.user_id == User.id)
        .filter(
            EventRegistration.event_id.in_(event_ids),
            EventRegistration.role == EventRegistrationRoleEnum.usuario,
            User.role != UserRoleEnum.admin,
        )
        .group_by(EventRegistration.event_id)
        .all()
    )
    by_eid = {eid: cnt for eid, cnt in rows}
    return {e.id: int(by_eid.get(e.id, 0)) for e in events}


def get_event(db: Session, event_id: int, user: Optional[User] = None):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return None

    total_registrations = _attendee_count(event)
    viewer_role: Optional[str] = None
    if user is not None:
        if event.created_by == user.id:
            viewer_role = "organizador"
        else:
            mi_registro = (
                db.query(EventRegistration)
                .filter(
                    EventRegistration.event_id == event_id,
                    EventRegistration.user_id == user.id,
                )
                .first()
            )
            if mi_registro:
                viewer_role = mi_registro.role.value

    tin = _total_inscritos_por_eventos(db, [event])[event.id]
    return {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "capacity": event.capacity,
        "date": event.date,
        "state": event.state,
        "registered_count": total_registrations,
        "role": viewer_role,
        "total_inscritos": tin,
    }


def get_events(
    db: Session,
    user: Optional[User] = None,
    skip: int = 0,
    limit: int = 10,
    q: Optional[str] = None,
) -> Tuple[List[dict], int]:
    query = db.query(Event)
    if q:
        query = query.filter(Event.title.ilike(f"%{q}%"))
    total = query.count()
    items = query.order_by(Event.id.desc()).offset(skip).limit(limit).all()
    totals = _total_inscritos_por_eventos(db, items)
    serialized = []
    for e in items:
        row = _serialize_event_list_item(db, e, viewer=user)
        row["total_inscritos"] = totals[e.id]
        serialized.append(row)
    return serialized, total


def get_my_assistant_events(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 10,
    q: Optional[str] = None,
) -> Tuple[List[dict], int]:
    """Eventos donde el usuario es asistente del staff (no incluye solo ser organizador)."""
    query = (
        db.query(Event)
        .join(EventRegistration, EventRegistration.event_id == Event.id)
        .filter(
            EventRegistration.user_id == user.id,
            EventRegistration.role == EventRegistrationRoleEnum.asistente,
        )
    )
    if q:
        query = query.filter(Event.title.ilike(f"%{q}%"))
    total = query.count()
    items = query.order_by(Event.id.desc()).offset(skip).limit(limit).all()
    totals = _total_inscritos_por_eventos(db, items)
    serialized = []
    for e in items:
        row = _serialize_event_list_item(db, e, viewer=user)
        row["total_inscritos"] = totals[e.id]
        serialized.append(row)
    return serialized, total


def get_my_events(db: Session, user: User, skip: int = 0, limit: int = 10, q: Optional[str] = None):
    """Eventos creados por el usuario o aquellos donde es asistente del staff."""
    assistant_event_ids = (
        db.query(EventRegistration.event_id)
        .filter(
            EventRegistration.user_id == user.id,
            EventRegistration.role == EventRegistrationRoleEnum.asistente,
        )
    )
    query = db.query(Event).filter(
        or_(Event.created_by == user.id, Event.id.in_(assistant_event_ids))
    )
    if q:
        query = query.filter(Event.title.ilike(f"%{q}%"))
    total = query.count()
    items = query.order_by(Event.id.desc()).offset(skip).limit(limit).all()
    totals = _total_inscritos_por_eventos(db, items)
    serialized = []
    for e in items:
        row = _serialize_event_list_item(db, e, viewer=user)
        row["total_inscritos"] = totals[e.id]
        serialized.append(row)
    return serialized, total


def get_my_events_registration(db: Session, user: User, skip: int = 0, limit: int = 10):
    registrations = (
        db.query(EventRegistration)
        .filter(EventRegistration.user_id == user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [reg.event for reg in registrations]


def create_event(db: Session, event: EventCreate, user: User):
    if not can_create_event(user):
        raise HTTPException(status_code=403, detail="No autorizado para crear eventos")

    db_event = Event(**event.model_dump(), created_by=user.id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    event_obj = db_event

    tin = _total_inscritos_por_eventos(db, [event_obj])[event_obj.id]
    return EventResponse(
        id=event_obj.id,
        title=event_obj.title,
        description=event_obj.description,
        capacity=event_obj.capacity,
        date=event_obj.date,
        state=event_obj.state,
        total_inscritos=tin,
    )


def update_event(db: Session, event_id: int, event: EventUpdate, user: User):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not can_edit_or_delete_event(user, db_event):
        raise HTTPException(status_code=403, detail="No autorizado para editar este evento")

    for key, value in event.model_dump(exclude_unset=True).items():
        setattr(db_event, key, value)

    db.commit()
    db.refresh(db_event)
    return db_event


def delete_event(db: Session, event_id: int, user: User):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not can_edit_or_delete_event(user, db_event):
        raise HTTPException(status_code=403, detail="No autorizado para eliminar este evento")

    db.delete(db_event)
    db.commit()
    return db_event


def transfer_event_organizer(
    db: Session,
    event_id: int,
    body: EventOrganizerTransfer,
    current_user: User,
):
    """Cede la titularidad del evento (`created_by`). El ex-organizador queda como participante si no tenía inscripción."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not can_transfer_event_organizer(current_user, event):
        raise HTTPException(
            status_code=403,
            detail="Solo el administrador o el organizador actual pueden trasladar la titularidad",
        )

    new_id = body.user_id
    if new_id == event.created_by:
        raise HTTPException(status_code=400, detail="Ese usuario ya es el organizador del evento")

    new_user = db.query(User).filter(User.id == new_id).first()
    if not new_user:
        raise HTTPException(status_code=404, detail="User not found")

    old_id = event.created_by

    reg_new = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.user_id == new_id,
            EventRegistration.event_id == event_id,
        )
        .first()
    )
    if reg_new:
        db.delete(reg_new)

    event.created_by = new_id
    db.add(event)

    if old_id != new_id:
        old_reg = (
            db.query(EventRegistration)
            .filter(
                EventRegistration.user_id == old_id,
                EventRegistration.event_id == event_id,
            )
            .first()
        )
        if not old_reg:
            _check_capacity_usuario_if_needed(db, event, None, EventRegistrationRoleEnum.usuario)
            db.add(
                EventRegistration(
                    user_id=old_id,
                    event_id=event_id,
                    role=EventRegistrationRoleEnum.usuario,
                )
            )

    db.commit()
    db.refresh(event)
    return {"msg": "Organizador actualizado", "created_by": event.created_by}


def register_user_to_event(
    db: Session,
    user_id: int,
    event_id: int,
    body: EventRegistrationAssignBody,
    current_user: User,
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not can_manage_event_staff(db, current_user, event):
        raise HTTPException(status_code=403, detail="No autorizado para registrar usuarios en este evento")

    target_role = EventRegistrationRoleEnum[body.role]

    already_registered = db.query(EventRegistration).filter_by(user_id=user_id, event_id=event_id).first()
    if already_registered:
        _assert_registration_role_transition(
            db, event, current_user, user_id, already_registered.role, target_role
        )
        _check_capacity_usuario_if_needed(db, event, already_registered.role, target_role)
        already_registered.role = target_role
        db.commit()
        db.refresh(already_registered)
        return {
            "user_id": already_registered.user_id,
            "event_id": already_registered.event_id,
            "role": already_registered.role.value,
        }

    if is_event_asistente(db, current_user, event_id) and not is_admin(current_user):
        if target_role != EventRegistrationRoleEnum.usuario:
            raise HTTPException(
                status_code=403,
                detail="Los asistentes solo pueden añadir participantes con rol usuario",
            )

    _assert_registration_role_transition(db, event, current_user, user_id, None, target_role)
    _check_capacity_usuario_if_needed(db, event, None, target_role)

    registration = EventRegistration(user_id=user_id, event_id=event_id, role=target_role)
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return {
        "user_id": registration.user_id,
        "event_id": registration.event_id,
        "role": registration.role.value,
    }


def update_rol_user_to_event(
    db: Session,
    user_id: int,
    event_id: int,
    body: EventRegistrationRoleUpdate,
    current_user: User,
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not can_manage_event_staff(db, current_user, event):
        raise HTTPException(status_code=403, detail="No autorizado para cambiar roles en este evento")

    registration = db.query(EventRegistration).filter_by(user_id=user_id, event_id=event_id).first()

    if not registration:
        raise HTTPException(status_code=404, detail="User not registered for this event")

    if user_id != current_user.id:
        target = db.query(User).filter(User.id == user_id).first()
        if target and target.role == UserRoleEnum.admin:
            raise HTTPException(
                status_code=400,
                detail="Las cuentas de administrador no se gestionan desde aquí; tienen acceso global a todos los eventos.",
            )

    new_role = EventRegistrationRoleEnum[body.role]
    _assert_registration_role_transition(db, event, current_user, user_id, registration.role, new_role)
    _check_capacity_usuario_if_needed(db, event, registration.role, new_role)
    registration.role = new_role
    db.commit()
    db.refresh(registration)
    return {
        "user_id": registration.user_id,
        "event_id": registration.event_id,
        "role": registration.role.value,
    }


def remove_event_registration(db: Session, event_id: int, user_id: int, current_user: User):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if user_id == event.created_by:
        raise HTTPException(
            status_code=400,
            detail="El organizador no puede quitarse del evento así; traslada la titularidad a otra persona primero.",
        )

    registration = db.query(EventRegistration).filter_by(user_id=user_id, event_id=event_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="User not registered for this event")

    if user_id == current_user.id:
        db.delete(registration)
        db.commit()
        return {"msg": "Has abandonado el evento", "user_id": user_id, "event_id": event_id}

    target = db.query(User).filter(User.id == user_id).first()
    if target and target.role == UserRoleEnum.admin:
        raise HTTPException(
            status_code=400,
            detail="Las cuentas de administrador no se gestionan en este listado; tienen acceso global a todos los eventos.",
        )

    if not can_manage_event_staff(db, current_user, event):
        raise HTTPException(
            status_code=403,
            detail="No autorizado para quitar usuarios de las inscripciones de este evento",
        )

    if (
        is_event_asistente(db, current_user, event_id)
        and not is_admin(current_user)
        and not is_event_creator(current_user, event)
    ):
        raise HTTPException(
            status_code=403,
            detail="Los asistentes no pueden eliminar inscripciones de otras personas; pueden abandonar su rol de asistente desde la opción correspondiente.",
        )

    db.delete(registration)
    db.commit()
    return {"msg": "Usuario eliminado del evento", "user_id": user_id, "event_id": event_id}


def register_to_guest_endpoint(db: Session, event_id: int, current_user: User):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.date < date_cls.today():
        raise HTTPException(
            status_code=400,
            detail="El evento ya expiró (la fecha del evento ya pasó).",
        )

    if _attendee_count(event) >= event.capacity:
        raise HTTPException(
            status_code=400,
            detail="El evento ha alcanzado su capacidad máxima.",
        )

    if is_event_creator(current_user, event):
        raise HTTPException(
            status_code=400,
            detail="El organizador del evento no puede inscribirse como participante en el mismo evento.",
        )

    already_registered = db.query(EventRegistration).filter_by(user_id=current_user.id, event_id=event_id).first()
    if already_registered:
        raise HTTPException(status_code=400, detail="User already registered for this event")

    registration = EventRegistration(user_id=current_user.id, event_id=event_id, role=EventRegistrationRoleEnum.usuario)
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return {
        "user_id": registration.user_id,
        "event_id": registration.event_id,
        "role": EventRegistrationRoleEnum.usuario.value,
    }


def search_events_by_title(db: Session, search_query: str) -> List[Event]:
    return db.query(Event).filter(Event.title.ilike(f"%{search_query}%")).all()


def list_event_registrations(
    db: Session,
    event_id: int,
    current_user: User,
    q: str = "",
    skip: int = 0,
    limit: int = 10,
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not can_manage_event_staff(db, current_user, event):
        raise HTTPException(status_code=403, detail="No autorizado para ver inscripciones de este evento")

    organizer = db.query(User).filter(User.id == event.created_by).first()
    qn = q.strip().lower()

    def _user_matches_search(u: User) -> bool:
        if not qn:
            return True
        return qn in (u.name or "").lower() or qn in (u.email or "").lower()

    rows_reg = (
        db.query(EventRegistration, User)
        .join(User, EventRegistration.user_id == User.id)
        .filter(EventRegistration.event_id == event_id)
        .all()
    )

    staff_items: List[dict] = []
    user_items: List[dict] = []
    for reg, u in rows_reg:
        if u.id == event.created_by:
            continue
        if u.role == UserRoleEnum.admin:
            continue
        if not _user_matches_search(u):
            continue
        row = {"user_id": u.id, "name": u.name, "email": u.email, "role": reg.role.value}
        if reg.role == EventRegistrationRoleEnum.asistente:
            staff_items.append(row)
        else:
            user_items.append(row)

    staff_items.sort(key=lambda x: (x["name"] or "").lower())
    user_items.sort(key=lambda x: (x["name"] or "").lower())

    merged: List[dict] = []
    if organizer and organizer.role != UserRoleEnum.admin and _user_matches_search(organizer):
        merged.append(
            {
                "user_id": organizer.id,
                "name": organizer.name,
                "email": organizer.email,
                "role": "organizador",
            }
        )
    merged.extend(staff_items)
    merged.extend(user_items)

    total = len(merged)
    items = merged[skip : skip + limit]
    return {"items": items, "total": total}


def search_users_for_event(
    db: Session,
    event_id: int,
    current_user: User,
    q: str = "",
    skip: int = 0,
    limit: int = 10,
    omit_event_members: bool = True,
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not can_manage_event_staff(db, current_user, event):
        raise HTTPException(status_code=403, detail="No autorizado para buscar usuarios en este evento")

    query = db.query(User)
    if omit_event_members:
        # Asignar participante/asistente: excluir titular e inscritos actuales.
        ya_inscrito = exists().where(
            EventRegistration.event_id == event_id,
            EventRegistration.user_id == User.id,
        )
        query = query.filter(User.id != event.created_by, ~ya_inscrito)
    else:
        # Trasladar titularidad: puede ser un asistente/participante ya en el evento; no el organizador actual.
        query = query.filter(User.id != event.created_by)
    if q.strip():
        pattern = f"%{q.strip()}%"
        query = query.filter(or_(User.name.ilike(pattern), User.email.ilike(pattern)))
    total = query.count()
    items = query.order_by(User.id).offset(skip).limit(limit).all()
    return {"items": items, "total": total}


def get_event_sessions(db: Session, event_id: int) -> List[EventSession]:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event.sessions


def create_event_session(db: Session, event_id: int, session_data: EventSessionCreate, current_user: User) -> EventSession:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.created_by != current_user.id and not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Not authorized to manage sessions for this event")

    if session_data.capacity > event.capacity:
        raise HTTPException(status_code=400, detail="Session capacity cannot exceed event capacity")

    overlaps = (
        db.query(EventSession)
        .filter(
            EventSession.event_id == event_id,
            EventSession.start_time < session_data.end_time,
            EventSession.end_time > session_data.start_time,
        )
        .count()
    )
    if overlaps > 0:
        raise HTTPException(status_code=400, detail="Session schedule overlaps with another session")

    db_session = EventSession(event_id=event_id, **session_data.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session
