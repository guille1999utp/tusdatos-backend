"""Permisos: rol global solo admin/usuario.

- Organizador del evento: quien lo creó (`events.created_by`); no es un rol en `users`.
- Editar o eliminar un evento: solo admin global o el organizador (creador).
- Gestionar inscripciones (alta/baja de participantes en el evento): admin, organizador o
  usuarios con rol de asistente en `event_registrations` para ese evento.
- Cambiar el rol dentro del evento: admin u organizador pueden alternar usuario/asistente; admin u organizador pueden
  trasladar la titularidad (`created_by`) a otro usuario. Un asistente puede promover de usuario a asistente y abandonar
  su propio rol asistente→usuario; no puede borrar inscripciones ajenas ni cambiar organizador.
"""

from sqlalchemy.orm import Session

from models.event import Event, EventRegistration
from models.roles import EventRegistrationRoleEnum, UserRoleEnum
from models.user import User


def is_admin(user: User) -> bool:
    return user.role == UserRoleEnum.admin


def is_event_creator(user: User, event: Event) -> bool:
    """Organizador del evento: quien lo creó (`events.created_by`)."""
    return event.created_by == user.id


def is_event_asistente(db: Session, user: User, event_id: int) -> bool:
    reg = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.user_id == user.id,
            EventRegistration.event_id == event_id,
            EventRegistration.role == EventRegistrationRoleEnum.asistente,
        )
        .first()
    )
    return reg is not None


def can_manage_event_staff(db: Session, user: User, event: Event) -> bool:
    """Puede gestionar inscripciones: admin, creador del evento o asistente asignado en `event_registrations`."""
    if is_admin(user):
        return True
    if is_event_creator(user, event):
        return True
    return is_event_asistente(db, user, event.id)


def can_edit_or_delete_event(user: User, event: Event) -> bool:
    """Solo admin o el creador del evento."""
    if is_admin(user):
        return True
    return is_event_creator(user, event)


def can_create_event(user: User) -> bool:
    """Cualquier usuario autenticado puede crear eventos (queda como organizador vía `created_by`)."""
    return user is not None


def can_change_global_role(actor: User) -> bool:
    return is_admin(actor)


def can_transfer_event_organizer(user: User, event: Event) -> bool:
    """Solo admin global o el organizador actual pueden cambiar `events.created_by`."""
    if is_admin(user):
        return True
    return is_event_creator(user, event)

