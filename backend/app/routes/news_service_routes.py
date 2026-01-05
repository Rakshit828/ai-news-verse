from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio.session import AsyncSession
from typing import List

from app.auth.dependencies import AccessTokenBearer
from app.models.ai_news_service import (
    ResponseCategoryDataModel,
    SetUsersCategoriesModel,
    UpdateUsersCategoriesModel,
    CreateCustomCategoryDataModel,
    CreateSubcategoriesToCategoryModel,
    TodayNewsResponse
)
from app.services.ai_news_service import NewsDBService, CategoriesDBService
from app.db.main import get_session
from app.response import SuccessResponse
from loguru import logger




news_routes = APIRouter()

category_service = CategoriesDBService()
news_service = NewsDBService()



@news_routes.get(
    '/category-data', response_model=SuccessResponse[ResponseCategoryDataModel], description="Returs the existing categories in the database to select from to show in UI."
)
async def get_initial_category_data(session: AsyncSession = Depends(get_session)):
    category_data = await category_service.get_categories_data(session=session)
    return SuccessResponse[ResponseCategoryDataModel](
        status_code=status.HTTP_200_OK,
        message="Returned Categories Successfully.",
        data=category_data,
    )


@news_routes.post(
    "/set/categories", response_model=SuccessResponse[ResponseCategoryDataModel]
)
async def set_user_categories(
    categories_data: SetUsersCategoriesModel,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[ResponseCategoryDataModel]:
    user_id = decoded_token["sub"]
    result: ResponseCategoryDataModel = (
        await category_service.set_user_categories(
            user_id=user_id, categories_data=categories_data, session=session
        )
    )
    return SuccessResponse[ResponseCategoryDataModel](
        status_code=status.HTTP_201_CREATED,
        message="Categories Set Successfully.",
        data=result,
    )


@news_routes.put(
    "/update/categories",
    response_model=SuccessResponse[ResponseCategoryDataModel],
)
async def update_user_categories(
    categories_data: UpdateUsersCategoriesModel,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[ResponseCategoryDataModel]:
    user_id = decoded_token["sub"]
    result: ResponseCategoryDataModel = (
        await category_service.update_user_categories(
            user_id=user_id, categories_data=categories_data, session=session
        )
    )
    return SuccessResponse[ResponseCategoryDataModel](
        status_code=status.HTTP_201_CREATED,
        message="Categories Set Successfully.",
        data=result,
    )


@news_routes.get(
    "/get/my-categories",
    response_model=SuccessResponse[ResponseCategoryDataModel],
)
async def get_user_categories(
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[ResponseCategoryDataModel]:
    user_id = decoded_token["sub"]
    result: ResponseCategoryDataModel = (
        await category_service.get_user_categories(user_id=user_id, session=session)
    )
    return SuccessResponse[ResponseCategoryDataModel](
        status_code=status.HTTP_200_OK,
        message="Returned Categories Successfully",
        data=result,
    )


@news_routes.post(
    "/create/category",
    response_model=SuccessResponse[ResponseCategoryDataModel],
    description="Allows the users to create the custom category with subcategories.",
)
async def create_own_category(
    category_data: CreateCustomCategoryDataModel,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[ResponseCategoryDataModel]:
    user_id = decoded_token["sub"]
    result: ResponseCategoryDataModel = (
        await category_service.create_custom_category(
            user_id=user_id, category_data=category_data, session=session
        )
    )
    return SuccessResponse[ResponseCategoryDataModel](
        status_code=status.HTTP_201_CREATED,
        message="Category Created Successfully",
        data=result,
    )


@news_routes.post(
    "/add-subcategories",
    response_model=SuccessResponse[ResponseCategoryDataModel],
    description="Allows the users to add new subcategories to the existing category.",
)
async def add_subcategories_to_category(
    payload: CreateSubcategoriesToCategoryModel,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[ResponseCategoryDataModel]:
    user_id = decoded_token["sub"]
    result: ResponseCategoryDataModel = (
        await category_service.add_subcategories_to_existing_category(
            user_id=user_id,
            category_id=payload.category_id,
            subcategories_data=payload.subcategories,
            session=session,
        )
    )
    return SuccessResponse[ResponseCategoryDataModel](
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
