from pydantic import BaseModel
from typing import Optional, List, Tuple

class SubCategoryModel(BaseModel):
    subcategory_id: str
    title: str

class CategoryModel(BaseModel):
    category_id: str
    title: str

class CreateSubcategoryModel(SubCategoryModel):
    added_by_users: bool = True

class CreateCategoryData(CategoryModel):
    """Represents the full data of single category.
    ```json
        {
            category_id: "ai_research",
            title: "AI Research",
            subcategories: [
                { "id": "transformers", "title": "Transformers Research" }
            ]
        }
    ```
    """
    subcategories: Optional[List[CreateSubcategoryModel]]
    added_by_users: bool = True

class AddSubcategoriesToCategoryModel(BaseModel):
    category_id: str
    subcategories: List[CreateSubcategoryModel]
    
# Response for all category related tasks
class ResponseCategoryData(CategoryModel):
    subcategories: Optional[List[SubCategoryModel]]


# For setting and updating the categories
class SetCategoryModel(BaseModel):
    category_id: str
    subcategories: List[str]

# Both classes are same but used for naming only 
class SetCategoriesUsers(BaseModel):
    categories_data: List[SetCategoryModel]

class UpdateCategoriesUsers(BaseModel):
    categories_data: List[SetCategoryModel]




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
 
