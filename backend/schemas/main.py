from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from datetime import date as DateType, datetime as DateTime
from typing import Optional, Literal, List
from models.event import EventStateEnum

# ──────────────── Roles ────────────────

# Rol global en `users` (solo admin + usuario).
GlobalUserRole = Literal["admin", "usuario"]

# Rol contextual al listar un evento (creador = organizador; inscripción = usuario/asistente).
EventContextRole = Literal["organizador", "asistente", "usuario"]

# Compat: nombre histórico usado en algunos imports.
ValidRoles = GlobalUserRole


# ──────────────── Usuarios ────────────────

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str

class UserBase(BaseModel):
    email: EmailStr
    role: GlobalUserRole = "usuario"

class UserCreate(UserBase):
    email: EmailStr
    password: str
    role: GlobalUserRole = "usuario"
    name: str

class UserRolUpdate(BaseModel):
    role: GlobalUserRole = "usuario"


class EventRegistrationAssignBody(BaseModel):
    """Rol del usuario dentro del evento al registrarlo manualmente."""
    role: Literal["usuario", "asistente"] = "usuario"


class EventRegistrationRoleUpdate(BaseModel):
    """Cambiar rol de un usuario ya inscrito en el evento (solo admin o creador del evento)."""
    role: Literal["usuario", "asistente"]


class EventOrganizerTransfer(BaseModel):
    """Nuevo titular del evento (`events.created_by`). El anterior pasa a participante si no tenía fila en inscripciones."""

    user_id: int


class User(UserBase):
    id: int
    created_at: DateTime

class UserUpdate(BaseModel):
    pass

# ──────────────── Eventos ────────────────

ValidEventStates = Literal["scheduled", "ongoing", "completed", "cancelled"]


class EventBase(BaseModel):
    title: str
    description: Optional[str]
    date: DateType
    capacity: int
    state: ValidEventStates = "scheduled"

    @field_validator("capacity")
    @classmethod
    def capacity_must_be_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("La capacidad debe ser mayor a 0")
        return v


class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[DateType] = None
    capacity: Optional[int] = None
    state: Optional[ValidEventStates] = None

    @field_validator("capacity")
    @classmethod
    def capacity_must_be_positive(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 1:
            raise ValueError("La capacidad debe ser mayor a 0")
        return v

class Event(EventBase):
    id: int
    registered_count: Optional[int] = 0


# ──────────────── Registro de Asistentes ────────────────

class EventRegistrationBase(BaseModel):
    user_id: int
    event_id: int
    role: Literal["usuario", "asistente"] = "usuario"

class EventRegistrationCreate(EventRegistrationBase):
    pass

class EventRegistration(EventRegistrationBase):
    id: int
    registered_at: DateTime

# Schema para la salida de EventRegistration
class EventRegistrationOut(EventRegistrationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    registered_at: DateTime

# ──────────────── EventResponse (Pydantic) ────────────────
class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    capacity: int
    date: DateType
    state: EventStateEnum
    registered_count: Optional[int] = 0
    role: Optional[EventContextRole] = None
    total_inscritos: int = Field(
        default=0,
        description="Participantes que ingresan al aforo: inscripciones con rol usuario, sin admins globales (no incluye organizador ni asistentes).",
    )


class PaginatedEvents(BaseModel):
    items: List[EventResponse]
    total: int


class EventParticipantItem(BaseModel):
    """Persona ligada al evento: organizador (creador), asistente o participante (usuario)."""

    user_id: int
    name: str
    email: str
    role: Literal["organizador", "asistente", "usuario"]


class PaginatedEventParticipants(BaseModel):
    items: List[EventParticipantItem]
    total: int


class PaginatedUsers(BaseModel):
    items: List[UserResponse]
    total: int


class UpdateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    msg: str
    logout_required: bool = Field(
        default=False,
        description="True si quien llamó ya no es administrador y debe cerrar sesión.",
    )


class EventSessionBase(BaseModel):
    title: str
    speaker: str
    start_time: DateTime
    end_time: DateTime
    capacity: int

    @field_validator("capacity")
    @classmethod
    def session_capacity_must_be_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("La capacidad de la sesión debe ser mayor a 0")
        return v

    @field_validator("end_time")
    @classmethod
    def end_must_be_after_start(cls, v: DateTime, values) -> DateTime:
        start_time = values.data.get("start_time")
        if start_time and v <= start_time:
            raise ValueError("La hora de fin debe ser mayor a la hora de inicio")
        return v


class EventSessionCreate(EventSessionBase):
    pass


class EventSessionResponse(EventSessionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_id: int