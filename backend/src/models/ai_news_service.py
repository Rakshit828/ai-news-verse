from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Tuple, Literal
from uuid import UUID, uuid4
from pydantic import ConfigDict



# News Notification Message
class NewNewsNotification(BaseModel):
    guid: str
    title: str
    link: str
    source: Literal['OPENAI', 'GOOGLE', 'HACKERNOON', 'ANTHROPIC']
    category_id: str | None = None
    subcategory_id: str
    description: str | None = None
    summary: str | None = None


    model_config = ConfigDict(extra="ignore")



# Response for all category related tasks
class SubCategoryModel(BaseModel):
    subcategory_id: UUID
    title: str

    model_config = ConfigDict(extra="ignore")


class ResponseCategoryData(BaseModel):
    category_id: UUID
    title: str
    subcategories: Optional[List[SubCategoryModel]]

    model_config = ConfigDict(extra="ignore")


class ResponseCategoryDataModel(BaseModel):
    """Use when you need to give full category data response"""

    categories_data: List[ResponseCategoryData]

    @model_validator(mode="before")
    @classmethod
    def to_response_category_data(cls, values):
        # This is a list of ORM objects of 'Category' model
        categories = values["categories_data"]
        values["categories_data"] = []
        for category in categories:
            single_cat_data = {
                "category_id": category.category_id,
                "title": category.title,
                "subcategories": [
                    {
                        "subcategory_id": subcategory.subcategory_id,
                        "title": subcategory.title,
                    }
                    for subcategory in category.subcategories
                ],
            }
            values["categories_data"].append(single_cat_data)
        return values

    model_config = ConfigDict(extra="ignore")


# For setting and updating the categories
class SetCategoriesData(BaseModel):
    category_id: UUID
    subcategories: List[UUID]

    model_config = ConfigDict(extra="ignore")


# Both classes are same but used for naming only
class SetUsersCategoriesModel(BaseModel):
    """Use to set the users categories for first time."""

    categories_data: List[SetCategoriesData]

    model_config = ConfigDict(extra="ignore")


class UpdateUsersCategoriesModel(BaseModel):
    """Use to update the users categories."""

    categories_data: List[SetCategoriesData]

    model_config = ConfigDict(extra="ignore")


class CreateCustomSubcategoryModel(BaseModel):
    title: str
    category_id: UUID

    model_config = ConfigDict(extra="ignore")


class CreateCustomCategoryModel(BaseModel):
    """Use to create a custom category with full data.
    ```json
        {
            title: "AI Research",
        }
    ```
    """

    title: str

    model_config = ConfigDict(extra="ignore")


class BaseArticleResponse(BaseModel):
    title: str
    url: str
    description: str
    category_id: UUID | None
    subcategory_id: UUID | None

    model_config = ConfigDict(extra="ignore")


class GoogleNewsResponse(BaseArticleResponse):
    source: str = "GOOGLE"


class AnthropicNewsResponse(BaseArticleResponse):
    source: str = "ANTHROPIC"


class OpenaiNewsResponse(BaseArticleResponse):
    source: str = "OPENAI"


class HackernoonResponse(BaseArticleResponse):
    source: str = "HACKERNOON"




# Endpoint responses.

class TodayNewsResponse(BaseModel):
    google: Tuple[GoogleNewsResponse, ...] | None = None
    anthropic: Tuple[AnthropicNewsResponse, ...] | None = None
    openai: Tuple[OpenaiNewsResponse, ...] | None = None
    hackernoon: Tuple[HackernoonResponse, ...] | None = None

    model_config = ConfigDict(extra="ignore")

class CategoryDataResponse(BaseModel):
    """Response model for the endpoint."""
    # THis is created to avoid the above model_validator execution in response serialization.
    categories_data: list[ResponseCategoryData]

class CategoryAlreadyExistsResponse(BaseModel):
    """Use when category already exists but doesn't belong to the user."""

    category_id: str
    category_title: str
    model_config = ConfigDict(extra="ignore")


class SimilarCategoryExistsResponse(BaseModel):
    """Use when category already exists but doesn't belong to the user."""

    category_id: str
    category_title: str
    model_config = ConfigDict(extra="ignore")


class SubcategoryAlreadyExistsResponse(BaseModel):
    """Use when subcategory already exists but doesn't belong to the user."""

    subcategory_id: str
    subcategory_title: str
    model_config = ConfigDict(extra="ignore")


class SimilarSubcategoryExistsResponse(BaseModel):
    """Use when subcategory already exists but doesn't belong to the user."""

    subcategory_id: str
    subcategory_title: str
    model_config = ConfigDict(extra="ignore")
