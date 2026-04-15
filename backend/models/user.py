from sqlalchemy import Column, Integer, String, DateTime, text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database.main import Base
from models.db_types import UserRoleColumn
from models.roles import UserRoleEnum





class User(Base):

    __tablename__ = "users"



    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False, index=True)

    hashed_password = Column(String, nullable=False)

    role = Column(
        UserRoleColumn(),
        nullable=False,
        default=UserRoleEnum.usuario,
        server_default=text("'usuario'"),
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    created_events = relationship(
        "Event",
        back_populates="creator",
        cascade="all, delete-orphan",
    )

    registrations = relationship(
        "EventRegistration",
        back_populates="user",
        cascade="all, delete-orphan",
    )


