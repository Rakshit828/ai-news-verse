from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, TypeAlias


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

class ClassifiedCategory(BaseModel):
    category: Category
    subcategory: SubCategory
    category_confidence: float
    subcategory_confidence: float



class BaseArticle(BaseModel):
    guid: str = Field(description="The url of the article source itself")
    title: str
    description: str
    url: str
    published_on: datetime

    model_config = ConfigDict(
        extra='ignore'
    )


class GoogleArticle(BaseArticle):
    source: str = 'GOOGLE'
    category: Category 
    sub_category: SubCategory | None = None
    markdown_content: str | None = None


class AnthropicArticle(BaseArticle):
    source: str = 'ANTHROPIC'
    category: Category 
    sub_category: SubCategory | None = None
    markdown_content: str | None = None


class OpenAiArticle(BaseArticle):
    source: str = 'OPENAI'
    category: Category 
    sub_category: SubCategory | None = None
    markdown_content: str | None = None


class HackernoonArticle(BaseArticle):
    source: str = 'HACKERNOON'
    category: Category 
    sub_category: SubCategory | None = None
    markdown_content: str | None = None


ServiceArticle: TypeAlias = GoogleArticle | AnthropicArticle | OpenAiArticle | HackernoonArticle
