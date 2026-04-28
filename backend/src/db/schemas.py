import enum
import uuid
from uuid import UUID
from typing import Optional, List
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import Index, Enum, text, String, func, ForeignKey
import sqlalchemy.dialects.postgresql as pg

from src.db.main import Base


class Source(str, enum.Enum):
    GOOGLE = "GOOGLE"
    ANTHROPIC = "ANTHROPIC"
    OPENAI = "OPENAI"
    HACKERNOON = "HACKERNOON"


class Users(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        pg.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )

    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(String(10), default="user", nullable=False)
    created_at: Mapped[str] = mapped_column(pg.TIMESTAMP, server_default=func.now())

    def __repr__(self) -> str:
        return f"<Users {self.email}>"


class Articles(Base):
    __tablename__ = "articles"

    id: Mapped[str] = mapped_column(pg.TEXT, primary_key=True)
    title: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    description: Mapped[str | None] = mapped_column(pg.TEXT, nullable=True)
    url: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    source: Mapped[enum.Enum] = mapped_column(
        Enum(Source, name="source_enum", native_enum=True)
    )
    published_on: Mapped[pg.TIMESTAMP] = mapped_column(pg.TIMESTAMP(timezone=True))
    markdown_content: Mapped[str] = mapped_column(pg.TEXT, nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(pg.TEXT, nullable=True)
    featured_image: Mapped[Optional[str]] = mapped_column(pg.TEXT, nullable=True)
    metadatas: Mapped[dict | None] = mapped_column(pg.JSONB, nullable=True)

    subcategory_id: Mapped[UUID | None] = mapped_column(
        pg.UUID(as_uuid=True),
        ForeignKey("subcategories.id", ondelete="SET NULL"),
        nullable=True,
    )

    subcategory: Mapped[Optional["SubCategory"]] = relationship(
        back_populates="news_articles"
    )

    __table_args__ = (
        Index("idx_published_on", "published_on"),
        Index("idx_publishedon_subcategory_id", "published_on", "subcategory_id"),
    )


class Category(Base):
    __tablename__ = "categories"
    id: Mapped[UUID] = mapped_column(pg.UUID(as_uuid=True), primary_key=True)
    name: Mapped[str] = mapped_column(pg.TEXT, nullable=False)

    subcategories: Mapped[List["SubCategory"]] = relationship(
        back_populates="category", cascade="all, delete-orphan"
    )


class SubCategory(Base):
    __tablename__ = "subcategories"
    id: Mapped[UUID] = mapped_column(pg.UUID(as_uuid=True), primary_key=True)
    name: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    category_id: Mapped[UUID] = mapped_column(
        pg.UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=False,
    )

    news_articles: Mapped[Optional[List[Articles]]] = relationship(
        back_populates="subcategory"
    )
    category: Mapped["Category"] = relationship(back_populates="subcategories")


class UserSubCategory(Base):
    __tablename__ = "user_sub_categories"
    user_id: Mapped[UUID] = mapped_column(
        pg.UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    subcategory_id: Mapped[UUID] = mapped_column(
        pg.UUID(as_uuid=True),
        ForeignKey("subcategories.id", ondelete="CASCADE"),
        primary_key=True,
    )
