from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from uuid import UUID

class SubCategory(BaseModel):
    subcategory_id: UUID = Field(alias="id")
    name: str

    model_config = ConfigDict(from_attributes=True)


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


class UpdateUsersCategoryModel(BaseModel):
    """Represents the data sent by the users to update their categories."""
    pass


class NewNewsNotification(BaseModel):
    """Represents a new article notification to be published to users."""
    guid: str
    title: str
    link: str
    description: Optional[str] = None
    summary: Optional[str] = None
    source: str
    category_id: UUID
    subcategory_id: UUID

    model_config = ConfigDict(from_attributes=True)

