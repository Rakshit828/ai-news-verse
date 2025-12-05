from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import func, ForeignKey, Index
import sqlalchemy.dialects.postgresql as pg
from typing import Optional

from app.database.main import Base



class GoogleArticles(Base):
    __tablename__ = "google_articles"

    guid: Mapped[str] = mapped_column(pg.TEXT, primary_key=True)
    title: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    description: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    url: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    published_on: Mapped[pg.TIMESTAMP] = mapped_column(
        pg.TIMESTAMP(timezone=True), server_default=func.now()
    )
    markdown_content: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(pg.TEXT, nullable=True)

    category_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("news_categories.category_id", ondelete="SET NULL"), nullable=False
    )
    subcategory_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("news_subcategories.subcategory_id", ondelete="SET NULL"), nullable=True
    )

    __table_args__ = (
        Index("idx_google_published_on", "published_on"),
        Index("idx_google_subcategory_id", "subcategory_id")
    )


class AnthropicArticles(Base):
    __tablename__ = "anthropic_articles"

    guid: Mapped[str] = mapped_column(pg.TEXT, primary_key=True)
    title: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    description: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    url: Mapped[str] = mapped_column(pg.VARCHAR(200), nullable=False)
    published_on: Mapped[pg.TIMESTAMP] = mapped_column(
        pg.TIMESTAMP(timezone=True), server_default=func.now()
    )
    markdown_content: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(pg.TEXT, nullable=True)

    category_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("news_categories.category_id", ondelete="SET NULL"), nullable=False
    )
    subcategory_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("news_subcategories.subcategory_id", ondelete="SET NULL"), nullable=True
    )

    __table_args__ = (
        Index("idx_anthropic_published_on", "published_on"),
        Index("idx_anthropic_subcategory_id", "subcategory_id")
    )


class OpenAiArticles(Base):
    __tablename__ = "openai_articles"

    guid: Mapped[str] = mapped_column(pg.TEXT, primary_key=True)
    title: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    description: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    url: Mapped[str] = mapped_column(pg.VARCHAR(200), nullable=False)
    published_on: Mapped[pg.TIMESTAMP] = mapped_column(
        pg.TIMESTAMP(timezone=True), server_default=func.now()
    )
    markdown_content: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(pg.TEXT, nullable=True)

    category_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("news_categories.category_id", ondelete="SET NULL"), nullable=False
    )
    subcategory_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("news_subcategories.subcategory_id", ondelete="SET NULL"), nullable=True
    )


    __table_args__ = (
        Index("idx_openai_published_on", "published_on"),
        Index("idx_openai_subcategory_id", "subcategory_id")
    )
