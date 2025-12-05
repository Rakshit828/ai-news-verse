from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, TypeAlias


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

class ScrapedArticle(BaseArticle):
    markdown_content: str = Field(description="The markdown content from the article's url.")



class GoogleArticle(ScrapedArticle):
    article_from: str = 'GOOGLE_NEWS'
    category: Category  | None = None
    sub_category: SubCategory | None = None


class AnthropicArticle(ScrapedArticle):
    article_from: str = 'ANTHROPIC'
    category: Category  
    sub_category: SubCategory | None = None


class OpenAiArticle(ScrapedArticle):
    article_from: str = 'OPENAI'
    category: Category  
    sub_category: SubCategory | None = None


class HackernoonArticle(ScrapedArticle):
    article_from: str = 'HACKERNOON'
    category: Category  
    sub_category: SubCategory | None = None


ClassifiedArticle: TypeAlias = GoogleArticle | AnthropicArticle | OpenAiArticle | HackernoonArticle
