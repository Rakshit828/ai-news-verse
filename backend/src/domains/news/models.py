from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime
from src.db.schemas import Source



class SubCategory(BaseModel):
    subcategory_id: UUID = Field(alias="id")
    name: str

    model_config = ConfigDict(from_attributes=True)

class NewsResponse(BaseModel):
    id: str
    title: str
    url: str
    source: Source
    summary: Optional[str]
    published_on: datetime
    metadatas: Optional[Dict]
    featured_image: Optional[str]
    subcategory: SubCategory


class Category(BaseModel):
    category_id: UUID = Field(alias="id")
    name: str

    model_config = ConfigDict(from_attributes=True)


class CategoryDataResponse(Category):
    """Represents the full data of single category."""
    subcategories: List[SubCategory]

    model_config = ConfigDict(from_attributes=True)


class CategoriesDataResponse(BaseModel):
    """Represents the data of all the category with subcategories."""
    categories: List[CategoryDataResponse]

    model_config = ConfigDict(from_attributes=True)


class SetUsersCategoryModel(BaseModel):
    """Represents the data sent by the users to set their categories."""
    categories: List[str]


class NewNewsNotification(BaseModel):
    """Represents a new article notification to be published to users."""
    id: str
    title: str
    url: str
    source: Source
    summary: Optional[str]
    published_on: datetime
    metadatas: Optional[Dict]
    featured_image: Optional[str]
    subcategory_id: str 

    model_config = ConfigDict(from_attributes=True)


class NewsTitleWithCategoryIds(BaseModel):
    title: str 
    subcategory: str 
    subcategory_id: UUID
    category: str 
    category_id: UUID
