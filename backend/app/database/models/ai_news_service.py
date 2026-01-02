from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import  ForeignKey, Index
import sqlalchemy.dialects.postgresql as pg
from typing import Optional
import enum

from app.database.main import Base

class Source(enum.Enum):
    GOOGLE = 'GOOGLE'
    ANTHROPIC = 'ANTHROPIC'
    OPENAI = 'OPENAI'
    HACKERNOON = 'HACKERNOON'

source_enum = pg.ENUM(
    'GOOGLE',
    'ANTHROPIC',
    'OPENAI',
    'HACKERNOON',
    name='source_enum'
)


class Articles(Base):
    __tablename__ = "articles"

    guid: Mapped[str] = mapped_column(pg.TEXT, primary_key=True)
    title: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    description: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    url: Mapped[str] = mapped_column(pg.TEXT, nullable=False)
    source: Mapped[enum.Enum] = mapped_column(pg.ENUM(name='source_enum'), nullable=False)
    published_on: Mapped[pg.TIMESTAMP] = mapped_column(
        pg.TIMESTAMP(timezone=True)
    )
    markdown_content: Mapped[str] = mapped_column(pg.TEXT, nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(pg.TEXT, nullable=True)

    category_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("news_categories.category_id", ondelete="SET NULL"), nullable=False
    )
    subcategory_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("news_subcategories.subcategory_id", ondelete="SET NULL"), nullable=True
    )

    __table_args__ = (
        Index("idx_published_on", "published_on"),
        Index("idx_subcategory_id", "subcategory_id"),
        Index('idx_source', "source")
    )

