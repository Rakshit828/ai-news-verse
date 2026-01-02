from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio.session import AsyncSession
from typing import List

from app.auth.dependencies import AccessTokenBearer
from app.database.schemas.ai_news_service import (
    SetCategoriesUsers,
    UpdateCategoriesUsers,
    CreateCategoryData,
    TodayNewsResponse,
    ResponseCategoryData,
    AddSubcategoriesToCategorySchema,
)
from app.database.services.ai_news_service import NewsDBService, CategoriesDBService
from app.database.main import get_session
from app.response import SuccessResponse
from loguru import logger


news_routes = APIRouter()

category_service = CategoriesDBService()
news_service = NewsDBService()




@news_routes.post(
    "/set/categories", response_model=SuccessResponse[List[ResponseCategoryData]]
)
async def set_user_categories(
    categories_data: SetCategoriesUsers,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[List[ResponseCategoryData]]:
    user_id = decoded_token["sub"]
    result: List[ResponseCategoryData] = await category_service.set_user_categories(
        user_id=user_id, categories_data=categories_data, session=session
    )
    return SuccessResponse[List[ResponseCategoryData]](
        status_code=status.HTTP_201_CREATED,
        message="Categories Set Successfully.",
        data=result,
    )


@news_routes.put(
    "/update/categories", response_model=SuccessResponse[List[ResponseCategoryData]]
)
async def update_user_categories(
    categories_data: UpdateCategoriesUsers,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[List[ResponseCategoryData]]:
    user_id = decoded_token["sub"]
    result: List[ResponseCategoryData] = await category_service.update_user_categories(
        user_id=user_id, categories_data=categories_data, session=session
    )
    return SuccessResponse[List[ResponseCategoryData]](
        status_code=status.HTTP_201_CREATED,
        message="Categories Set Successfully.",
        data=result,
    )



@news_routes.get(
    "/get/my-categories", response_model=SuccessResponse[List[ResponseCategoryData]]
)
async def get_user_categories(
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[List[ResponseCategoryData]]:
    user_id = decoded_token["sub"]
    result: List[ResponseCategoryData] = await category_service.get_user_categories(
        user_id=user_id, session=session
    )
    return SuccessResponse[List[ResponseCategoryData]](
        status_code=status.HTTP_200_OK,
        message="Returned Categories Successfully",
        data=result,
    )


@news_routes.post(
    "/create/category", response_model=SuccessResponse[List[ResponseCategoryData]]
)
async def create_own_category(
    category_data: CreateCategoryData,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[List[ResponseCategoryData]]:
    user_id = decoded_token["sub"]
    result: List[ResponseCategoryData] = await category_service.create_custom_category(
        user_id=user_id, category_data=category_data, session=session
    )
    return SuccessResponse[List[ResponseCategoryData]](
        status_code=status.HTTP_201_CREATED,
        message="Category Created Successfully",
        data=result,
    )


@news_routes.post(
    "/add-subcategories", response_model=SuccessResponse[List[ResponseCategoryData]]
)
async def add_subcategories_to_category(
    payload: AddSubcategoriesToCategorySchema,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[List[ResponseCategoryData]]:
    user_id = decoded_token["sub"]
    result: List[ResponseCategoryData] = (
        await category_service.add_subcategories_to_existing_category(
            user_id=user_id,
            category_id=payload.category_id,
            subcategories_data=payload.subcategories,
            session=session,
        )
    )
    return SuccessResponse[List[ResponseCategoryData]](
        status_code=status.HTTP_201_CREATED,
        message="Subcategories Added Successfully",
        data=result,
    )



@news_routes.get("/get/news", response_model=SuccessResponse[TodayNewsResponse])
async def get_latest_news(
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    user_id = decoded_token["sub"]
    today_news_response = await news_service.get_today_news(
        user_id=user_id, session=session
    )
    return SuccessResponse[TodayNewsResponse](
        status_code=status.HTTP_200_OK,
        message="Returned News Successfully",
        data=today_news_response,
    )