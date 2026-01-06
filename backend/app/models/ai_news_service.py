from pydantic import BaseModel, Field
from typing import Optional, List, Tuple
from uuid import UUID, uuid4



# Response for all category related tasks
class SubCategoryModel(BaseModel):
    subcategory_id: UUID
    title: str

class ResponseCategoryData(BaseModel):
    category_id: UUID
    title: str
    subcategories: Optional[List[SubCategoryModel]]

class ResponseCategoryDataModel(BaseModel):
    """Use when you need to give full category data response"""
    categories_data: List[ResponseCategoryData]


# For setting and updating the categories
class SetCategoriesData(BaseModel):
    category_id: UUID 
    subcategories: List[UUID]

# Both classes are same but used for naming only 
class SetUsersCategoriesModel(BaseModel):
    """Use to set the users categories for first time."""
    categories_data: List[SetCategoriesData]

class UpdateUsersCategoriesModel(BaseModel):
    """Use to update the users categories."""
    categories_data: List[SetCategoriesData]



class CreateCustomSubcategory(BaseModel):
    uuid: UUID = Field(default_factory=uuid4)
    title: str
    added_by_users: bool = True


class CreateCustomCategoryDataModel(BaseModel):
    """Use to create a custom category with full data.
    ```json
        {
            title: "AI Research",
            subcategories: [
                { "title": "Transformers Research" }
            ]
        }
    ```
    """
    uuid: UUID = Field(default_factory=uuid4)
    title: str
    added_by_users: bool = True
    subcategories: Optional[List[CreateCustomSubcategory]]


class CreateSubcategoriesToCategoryModel(BaseModel):
    """Use when adding new subcategories to existing category."""
    category_id: UUID
    subcategories: List[CreateCustomSubcategory]
    



class BaseArticleResponse(BaseModel):
    title: str
    url: str
    description: str
    category_id: str | None
    subcategory_id: str | None



class GoogleNewsResponse(BaseArticleResponse):
    source: str = 'GOOGLE'


class AnthropicNewsResponse(BaseArticleResponse):
    source: str = 'ANTHROPIC'


class OpenaiNewsResponse(BaseArticleResponse):
    source: str = 'OPENAI'

class HackernoonResponse(BaseArticleResponse):
    source: str = 'HACKERNOON'


class TodayNewsResponse(BaseModel):
    google: Tuple[GoogleNewsResponse, ...] | None = None
    anthropic: Tuple[AnthropicNewsResponse, ...] | None = None
    openai: Tuple[OpenaiNewsResponse, ...] | None = None
    hackernoon: Tuple[HackernoonResponse, ...] | None = None
 
