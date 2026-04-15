from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date as date_cls
from database.main import get_db
from schemas.main import (
    EventCreate,
    EventUpdate,
    EventRegistrationBase,
    EventResponse,
    EventSessionCreate,
    EventSessionResponse,
    EventRegistrationAssignBody,
    EventRegistrationRoleUpdate,
    EventOrganizerTransfer,
    PaginatedEvents,
    PaginatedEventParticipants,
)
from controllers.event import (
    get_event,
    get_events,
    create_event,
    update_event,
    delete_event,
    transfer_event_organizer,
    register_user_to_event,
    search_events_by_title,
    update_rol_user_to_event,
    register_to_guest_endpoint,
    get_my_events,
    get_my_assistant_events,
    get_my_events_registration,
    create_event_session,
    get_event_sessions,
    remove_event_registration,
    search_users_for_event,
    list_event_registrations,
)
from models.user import User
from core.security import get_current_user, get_current_user_optional

router = APIRouter()


@router.post("/", response_model=EventResponse)
def create_event_endpoint(
    event: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_event(db, event, current_user)


@router.get("/", response_model=PaginatedEvents)
def get_events_endpoint(
    skip: int = 0,
    limit: int = 10,
    q: Optional[str] = None,
    state: Optional[str] = None,
    date_from: Optional[date_cls] = None,
    date_to: Optional[date_cls] = None,
    min_capacity: Optional[int] = None,
    max_capacity: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    items, total = get_events(
        db,
        user=current_user,
        skip=skip,
        limit=limit,
        q=q,
        state=state,
        date_from=date_from,
        date_to=date_to,
        min_capacity=min_capacity,
        max_capacity=max_capacity,
    )
    return {"items": items, "total": total}


@router.get("/my-events", response_model=PaginatedEvents)
def get_my_events_endpoint(
    skip: int = 0,
    limit: int = 10,
    q: Optional[str] = None,
    state: Optional[str] = None,
    date_from: Optional[date_cls] = None,
    date_to: Optional[date_cls] = None,
    min_capacity: Optional[int] = None,
    max_capacity: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = get_my_events(
        db,
        user=current_user,
        skip=skip,
        limit=limit,
        q=q,
        state=state,
        date_from=date_from,
        date_to=date_to,
        min_capacity=min_capacity,
        max_capacity=max_capacity,
    )
    return {"items": items, "total": total}


@router.get("/my-assistant-events", response_model=PaginatedEvents)
def get_my_assistant_events_endpoint(
    skip: int = 0,
    limit: int = 10,
    q: Optional[str] = None,
    state: Optional[str] = None,
    date_from: Optional[date_cls] = None,
    date_to: Optional[date_cls] = None,
    min_capacity: Optional[int] = None,
    max_capacity: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = get_my_assistant_events(
        db,
        user=current_user,
        skip=skip,
        limit=limit,
        q=q,
        state=state,
        date_from=date_from,
        date_to=date_to,
        min_capacity=min_capacity,
        max_capacity=max_capacity,
    )
    return {"items": items, "total": total}


@router.get("/my-events-registers", response_model=PaginatedEvents)
def get_my_events_registration_endpoint(
    skip: int = 0,
    limit: int = 10,
    q: Optional[str] = None,
    state: Optional[str] = None,
    date_from: Optional[date_cls] = None,
    date_to: Optional[date_cls] = None,
    min_capacity: Optional[int] = None,
    max_capacity: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = get_my_events_registration(
        db,
        skip=skip,
        limit=limit,
        user=current_user,
        q=q,
        state=state,
        date_from=date_from,
        date_to=date_to,
        min_capacity=min_capacity,
        max_capacity=max_capacity,
    )
    return {"items": items, "total": total}


@router.get("/search/by-title", response_model=List[EventResponse])
def search_events_endpoint(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return search_events_by_title(db, query)


@router.get("/{event_id}/users/search")
def search_event_users_endpoint(
    event_id: int,
    q: str = "",
    skip: int = 0,
    limit: int = 10,
    omit_event_members: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return search_users_for_event(
        db,
        event_id,
        current_user,
        q=q,
        skip=skip,
        limit=limit,
        omit_event_members=omit_event_members,
    )


@router.get("/{event_id}/registrations", response_model=PaginatedEventParticipants)
def list_event_registrations_endpoint(
    event_id: int,
    q: str = "",
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_event_registrations(db, event_id, current_user, q=q, skip=skip, limit=limit)


@router.get("/{event_id}/sessions", response_model=List[EventSessionResponse])
def list_event_sessions_endpoint(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    return get_event_sessions(db, event_id)


@router.post("/{event_id}/sessions", response_model=EventSessionResponse)
def create_event_sessions_endpoint(
    event_id: int,
    session_data: EventSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_event_session(db, event_id, session_data, current_user)


@router.get("/{event_id}", response_model=EventResponse)
def get_event_endpoint(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    db_event = get_event(db, event_id, current_user)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event


@router.put("/{event_id}/organizer", response_model=dict)
def transfer_event_organizer_endpoint(
    event_id: int,
    body: EventOrganizerTransfer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return transfer_event_organizer(db, event_id, body, current_user)


@router.put("/{event_id}", response_model=EventResponse)
def update_event_endpoint(
    event_id: int,
    event: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_event(db, event_id, event, current_user)


@router.delete("/{event_id}", response_model=EventResponse)
def delete_event_endpoint(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_event(db, event_id, current_user)


@router.post("/{event_id}/register/{user_id}", response_model=EventRegistrationBase)
def register_to_event_endpoint(
    event_id: int,
    user_id: int,
    body: EventRegistrationAssignBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return register_user_to_event(
        db, user_id=user_id, event_id=event_id, body=body, current_user=current_user
    )


@router.put("/{event_id}/register/{user_id}", response_model=EventRegistrationBase)
def update_to_event_endpoint(
    event_id: int,
    user_id: int,
    body: EventRegistrationRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_rol_user_to_event(db, user_id=user_id, event_id=event_id, body=body, current_user=current_user)


@router.delete("/{event_id}/register/me")
def leave_event_as_current_user_endpoint(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """El usuario autenticado deja de estar inscrito en el evento (su propia fila en `event_registrations`)."""
    return remove_event_registration(db, event_id, current_user.id, current_user)


@router.delete("/{event_id}/register/{user_id}")
def remove_user_from_event_endpoint(
    event_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return remove_event_registration(db, event_id, user_id, current_user)


@router.post("/{event_id}", response_model=EventRegistrationBase)
def register_guest_endpoint(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return register_to_guest_endpoint(db, event_id=event_id, current_user=current_user)
