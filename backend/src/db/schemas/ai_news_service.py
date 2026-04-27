from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import ForeignKey, Index, Enum
import sqlalchemy.dialects.postgresql as pg
from typing import Optional
import enum

from src.db.main import Base


class Source(str, enum.Enum):
    GOOGLE = "GOOGLE"
    ANTHROPIC = "ANTHROPIC"
    OPENAI = "OPENAI"
    HACKERNOON = "HACKERNOON"


class Articles(Base):
    __tablename__ = "articles"

    guid: Mapped[str] = mapped_column(pg.TEXT, primary_key=True)
    title: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    description: Mapped[str | None] = mapped_column(pg.TEXT, nullable=True)
    url: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    source: Mapped[enum.Enum] = mapped_column(
        Enum(Source, name="source_enum", native_enum=True)
    )
    article_metadata: Mapped[dict | None] = mapped_column(pg.JSONB, nullable=True)
    published_on: Mapped[pg.TIMESTAMP] = mapped_column(pg.TIMESTAMP(timezone=True))
    markdown_content: Mapped[str] = mapped_column(pg.TEXT, nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(pg.TEXT, nullable=True)
    featured_image: Mapped[Optional[str]] = mapped_column(pg.TEXT, nullable=True)

    # Foreign keys
    category_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("news_categories.category_id", ondelete="SET NULL"), nullable=True
    )
    subcategory_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("news_subcategories.subcategory_id", ondelete="SET NULL"),
        nullable=True,
    )

    __table_args__ = (
        Index("idx_published_on", "published_on"),
        Index("idx_subcategory_id", "subcategory_id"),
        Index("idx_source", "source"),
    )


class UserDefinedArticleClassification(Base):
    __tablename__ = "user_defined_article_classification"

    article_id: Mapped[str] = mapped_column(
        ForeignKey("articles.guid", ondelete="CASCADE"), primary_key=True
    )
    subcategory_id: Mapped[str] = mapped_column(
        ForeignKey("news_subcategories.subcategory_id", ondelete="CASCADE"),
        primary_key=True,
    )
