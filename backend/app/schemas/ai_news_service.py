from pydantic import BaseModel
from typing import Optional, List, Tuple

class SubCategorySchema(BaseModel):
    subcategory_id: str
    title: str

class CategorySchema(BaseModel):
    category_id: str
    title: str

class CreateSubcategorySchema(SubCategorySchema):
    added_by_users: bool = True

class CreateCategoryData(CategorySchema):
    """Represents the full data of single category.
    ```json
        {
            category_id: "ai_esearch",
            title: "AI Research",
            subcategories: [
                { "id": "transformers", "title": "Transformers Research" }
            ]
        }
    ```
    """
    subcategories: Optional[List[CreateSubcategorySchema]]
    added_by_users: bool = True

class AddSubcategoriesToCategorySchema(BaseModel):
    category_id: str
    subcategories: List[CreateSubcategorySchema]
    
# Response for all category related tasks
class ResponseCategoryData(CategorySchema):
    subcategories: Optional[List[SubCategorySchema]]


# For setting and updating the categories
class SetCategorySchema(BaseModel):
    category_id: str
    subcategories: List[str]

# Both classes are same but used for naming only 
class SetCategoriesUsers(BaseModel):
    categories_data: List[SetCategorySchema]

class UpdateCategoriesUsers(BaseModel):
    categories_data: List[SetCategorySchema]




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
 
