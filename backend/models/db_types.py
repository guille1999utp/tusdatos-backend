"""Tipos SQLAlchemy que toleran datos legados antes de migrar enums en PostgreSQL."""

from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.types import TypeDecorator

from models.roles import EventRegistrationRoleEnum, UserRoleEnum


class UserRoleColumn(TypeDecorator):
    """Almacena el rol global como texto; al leer, cualquier valor distinto de admin → usuario."""

    impl = String(32)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return UserRoleEnum.usuario.value
        if isinstance(value, UserRoleEnum):
            return value.value
        s = str(value).strip().lower()
        return UserRoleEnum.admin.value if s == UserRoleEnum.admin.value else UserRoleEnum.usuario.value

    def process_result_value(self, value, dialect):
        if value is None:
            return UserRoleEnum.usuario
        s = str(value).strip().lower()
        if s == UserRoleEnum.admin.value:
            return UserRoleEnum.admin
        return UserRoleEnum.usuario


class EventRegistrationRoleColumn(TypeDecorator):
    """Rol por evento: solo asistente o usuario; el resto de etiquetas legadas → usuario."""

    impl = String(32)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return EventRegistrationRoleEnum.usuario.value
        if isinstance(value, EventRegistrationRoleEnum):
            return value.value
        s = str(value).strip().lower()
        if s == EventRegistrationRoleEnum.asistente.value:
            return EventRegistrationRoleEnum.asistente.value
        return EventRegistrationRoleEnum.usuario.value

    def process_result_value(self, value, dialect):
        if value is None:
            return EventRegistrationRoleEnum.usuario
        s = str(value).strip().lower()
        if s == EventRegistrationRoleEnum.asistente.value:
            return EventRegistrationRoleEnum.asistente
        return EventRegistrationRoleEnum.usuario
