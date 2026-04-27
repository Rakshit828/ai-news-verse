from pydantic import BaseModel, Field, ConfigDict
from typing import List
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
    pass


class UpdateUsersCategoryModel(BaseModel):
    """Represents the data sent by the users to update their categories."""
    pass 
