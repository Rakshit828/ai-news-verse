from __future__ import annotations
from uuid import UUID
from typing import List
from sqlalchemy import String, text, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import sqlalchemy.dialects.postgresql as pg
import uuid

from ..main import Base


class Users(Base):
    __tablename__ = "users"

    uuid: Mapped[UUID] = mapped_column(
        pg.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4(),
        server_default=text("gen_random_uuid()"),
    )

    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(String(10), default="user", nullable=False)
    created_at: Mapped[str] = mapped_column(pg.TIMESTAMP, server_default=func.now())

    # Many-to-many (Users ↔ Category)
    categories: Mapped[List[Category]] = relationship(
        secondary="user_categories", back_populates="users"
    )

    # Many-to-many (Users ↔ SubCategory)
    subcategories: Mapped[List[SubCategory]] = relationship(
        secondary="user_subcategories", back_populates="users"
    )

    def __repr__(self) -> str:
        return f"<Users {self.email}>"


class Category(Base):
    __tablename__ = "news_categories"

    category_id: Mapped[UUID] = mapped_column(
        pg.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4(),
        server_default=text("gen_random_uuid()"),
    )
    title: Mapped[str] = mapped_column(pg.VARCHAR(50), nullable=False)
    added_by_users: Mapped[bool] = mapped_column(pg.BOOLEAN, server_default=text("false"), nullable=False)

    subcategories: Mapped[List["SubCategory"]] = relationship(
        "SubCategory", back_populates="category", cascade="all, delete-orphan"
    )


    # Many to many relationship : Category <-> Users
    users: Mapped[List["Users"]] = relationship(
        "Users", secondary="user_categories", back_populates="categories"
    )


class SubCategory(Base):
    __tablename__ = "news_subcategories"

    subcategory_id: Mapped[UUID] = mapped_column(
        pg.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4(),
        server_default=text("gen_random_uuid()"),
    )
    title: Mapped[str] = mapped_column(pg.VARCHAR(50), nullable=False)
    added_by_users: Mapped[bool] = mapped_column(pg.BOOLEAN, server_default=text("false"), nullable=False)

    category_id: Mapped[str] = mapped_column(
        ForeignKey("news_categories.category_id", ondelete="CASCADE")
    )

    category: Mapped["Category"] = relationship(
        "Category", back_populates="subcategories"
    )

    # Many to many relationship : SubCategory <-> Users
    users: Mapped[List["Users"]] = relationship(
        "Users", secondary="user_subcategories", back_populates="subcategories"
    )


class UserCategory(Base):
    __tablename__ = "user_categories"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.uuid", ondelete="CASCADE"), primary_key=True
    )
    category_id: Mapped[str] = mapped_column(
        ForeignKey("news_categories.category_id", ondelete="CASCADE"), primary_key=True
    )


class UserSubCategory(Base):
    __tablename__ = "user_subcategories"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.uuid", ondelete="CASCADE"), primary_key=True
    )
    subcategory_id: Mapped[str] = mapped_column(
        ForeignKey("news_subcategories.subcategory_id", ondelete="CASCADE"), primary_key=True
    )

    
