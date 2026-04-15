"""Roles globales (usuarios) y roles por evento (inscripciones)."""

from enum import Enum as PyEnum


class UserRoleEnum(PyEnum):
    """Solo existe en tabla `users`: un admin y el resto usuarios."""

    admin = "admin"
    usuario = "usuario"

    @classmethod
    def list_roles(cls) -> list[str]:
        return [r.value for r in cls]


class EventRegistrationRoleEnum(PyEnum):
    """Rol dentro de `event_registrations`: participante o asistente del staff."""

    usuario = "usuario"
    asistente = "asistente"

    @classmethod
    def list_roles(cls) -> list[str]:
        return [r.value for r in cls]
