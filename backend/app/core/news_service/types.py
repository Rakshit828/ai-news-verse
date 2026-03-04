from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, TypeAlias, Literal
from app.core.ai.models import ClassificationResponse

MarkdownContent: TypeAlias = str

class SubCategory(BaseModel):
    subcategory_id: str
    title: str

class Category(BaseModel):
    category_id: str
    title: str

class CategoryData(Category):
    """Represents the full data of single category."""
    subcategories: List[SubCategory]

class CategoriesData(BaseModel):
    """Represents the data of all the category with subcategories."""
    categories: List[CategoryData]


class BaseArticle(BaseModel):
    guid: str = Field(description="The url of the article source itself")
    title: str
    description: str
    url: str
    published_on: datetime
    summary: str | None = None
    markdown_content: str | None = None
    classification: ClassificationResponse

    model_config = ConfigDict(
        extra='ignore'
    )


class ServiceArticle(BaseArticle):
    source: Literal["OPENAI", "GOOGLE", "ANTHROPIC", "HACKERNOON"]