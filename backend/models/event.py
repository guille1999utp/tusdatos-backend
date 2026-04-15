from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum, Text, DateTime, text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum

from database.main import Base
from models.db_types import EventRegistrationRoleColumn
from models.roles import EventRegistrationRoleEnum


class EventStateEnum(PyEnum):
    scheduled = "scheduled"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    date = Column(Date, nullable=False)
    capacity = Column(Integer, nullable=False)
    state = Column(Enum(EventStateEnum), default=EventStateEnum.scheduled)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    creator = relationship("User", back_populates="created_events", foreign_keys=[created_by])

    registrations = relationship(
        "EventRegistration",
        back_populates="event",
        cascade="all, delete-orphan",
    )
    sessions = relationship("EventSession", back_populates="event", cascade="all, delete-orphan")


class EventRegistration(Base):
    """Usuario ↔ evento con rol dentro del evento (participante o asistente). El organizador es `events.created_by`."""

    __tablename__ = "event_registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    role = Column(
        EventRegistrationRoleColumn(),
        nullable=False,
        default=EventRegistrationRoleEnum.usuario,
        server_default=text("'usuario'"),
    )
    registered_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="registrations")
    event = relationship("Event", back_populates="registrations")


class EventSession(Base):
    __tablename__ = "event_sessions"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    title = Column(String, nullable=False)
    speaker = Column(String, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    capacity = Column(Integer, nullable=False)

    event = relationship("Event", back_populates="sessions")
