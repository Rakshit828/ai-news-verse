import asyncio
from fastapi import (
    APIRouter,
    Depends,
    status,
    Request,
    WebSocket,
    WebSocketDisconnect,
    WebSocketException,
)
from sqlalchemy.ext.asyncio.session import AsyncSession
from typing import Union

from app.auth.dependencies import AccessTokenBearer
from app.models.ai_news_service import (
    SetUsersCategoriesModel,
    SimilarCategoryExistsResponse,
    SimilarSubcategoryExistsResponse,
    SubcategoryAlreadyExistsResponse,
    UpdateUsersCategoriesModel,
    CreateCustomCategoryModel,
    CreateCustomSubcategoryModel,
    CategoryAlreadyExistsResponse,
    TodayNewsResponse,
    CategoryDataResponse,
    CategoryDataResponse,
    ResponseCategoryDataModel,
)
from app.services.ai_news_service import NewsDBService, CategoriesDBService
from app.services.notification_system import PubSubSystem
from app.core.ai.components.pinecone_db import PineconeClient
from app.services.utils import safely_run_controllers
from app.db.dependencies import get_session
from app.response import SuccessResponse
from loguru import logger


news_routes = APIRouter()

category_service = CategoriesDBService()
news_service = NewsDBService()
redis_pubsub = PubSubSystem()


@news_routes.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket, user_id: str, session: AsyncSession = Depends(get_session)
):
    logger.debug(f"Client {user_id} is trying to connect.")
    # Accepting a connection
    await websocket.accept()
    logger.info(f"Client with id: {user_id} connected successfully.")

    categories_data: ResponseCategoryDataModel = await safely_run_controllers(
        func=category_service.get_user_categories, user_id=user_id, session=session
    )
    # Channels is a list of the user subcategories ids.
    channels: list[str] = [
        str(subcategory.subcategory_id)
        for category in categories_data.categories_data
        for subcategory in category.subcategories
    ]

    # Create a task per category
    tasks = [
        asyncio.create_task(redis_pubsub.subscribe_and_listen(channel, websocket))
        for channel in channels
    ]
    try:
        await asyncio.gather(*tasks)
    except WebSocketDisconnect:
        logger.info(f"Client with user_id: {user_id} disconnected.")
        for task in tasks:
            task.cancel()
    except Exception as e:
        logger.error(str(e))


@news_routes.get(
    "/category",
    response_model=SuccessResponse[CategoryDataResponse],
    description="Returs the existing categories in the database to select from to show in UI.",
)
async def get_initial_category_data(
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[CategoryDataResponse]:
    category_data: ResponseCategoryDataModel = await safely_run_controllers(
        category_service.get_categories_data, session=session
    )
    return SuccessResponse[CategoryDataResponse](
        status_code=status.HTTP_200_OK,
        message="Returned Categories Successfully.",
        data=CategoryDataResponse(categories_data=category_data.categories_data),
    )


@news_routes.post("/category", response_model=SuccessResponse[CategoryDataResponse])
async def set_user_categories(
    categories_data: SetUsersCategoriesModel,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[CategoryDataResponse]:
    user_id = decoded_token["sub"]
    result: ResponseCategoryDataModel = await safely_run_controllers(
        category_service.set_user_categories,
        session=session,
        user_id=user_id,
        categories_data=categories_data,
    )
    return SuccessResponse[CategoryDataResponse](
        status_code=status.HTTP_201_CREATED,
        message="Categories Set Successfully.",
        data=CategoryDataResponse(categories_data=result.categories_data),
    )


@news_routes.put(
    "/category",
    response_model=SuccessResponse[CategoryDataResponse],
)
async def update_user_categories(
    categories_data: UpdateUsersCategoriesModel,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[CategoryDataResponse]:
    user_id = decoded_token["sub"]
    result: ResponseCategoryDataModel = await safely_run_controllers(
        category_service.update_user_categories,
        session=session,
        user_id=user_id,
        categories_data=categories_data,
    )
    return SuccessResponse[CategoryDataResponse](
        status_code=status.HTTP_201_CREATED,
        message="Categories Set Successfully.",
        data=CategoryDataResponse(categories_data=result.categories_data),
    )


@news_routes.get(
    "/category/me",
    response_model=SuccessResponse[CategoryDataResponse],
)
async def get_user_categories(
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[CategoryDataResponse]:
    user_id = decoded_token["sub"]
    result: ResponseCategoryDataModel = await safely_run_controllers(
        category_service.get_user_categories, session=session, user_id=user_id
    )
    return SuccessResponse[CategoryDataResponse](
        status_code=status.HTTP_200_OK,
        message="Returned Categories Successfully",
        data=CategoryDataResponse(categories_data=result.categories_data),
    )


@news_routes.post(
    "/category/custom",
    response_model=Union[
        SuccessResponse[CategoryDataResponse],
        SuccessResponse[CategoryAlreadyExistsResponse],
        SuccessResponse[SimilarCategoryExistsResponse],
    ],
    description="Allows the users to create the custom category with subcategories.",
)
async def create_own_category(
    req: Request,
    category_data: CreateCustomCategoryModel,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> Union[
    SuccessResponse[CategoryDataResponse],
    SuccessResponse[CategoryAlreadyExistsResponse],
    SuccessResponse[SimilarCategoryExistsResponse],
]:
    user_id = decoded_token["sub"]
    pinecone_client: PineconeClient = req.app.state.pinecone_client
    result: (
        ResponseCategoryDataModel
        | CategoryAlreadyExistsResponse
        | SimilarCategoryExistsResponse
    ) = await safely_run_controllers(
        category_service.create_custom_category,
        user_id=user_id,
        category_data=category_data,
        session=session,
        pinecone_client=pinecone_client,
    )
    if isinstance(result, CategoryAlreadyExistsResponse):
        return SuccessResponse[CategoryAlreadyExistsResponse](
            status_code=status.HTTP_200_OK,
            message="Category Already Exists. You can select it.",
            data=result,
        )
    if isinstance(result, SimilarCategoryExistsResponse):
        return SuccessResponse[SimilarCategoryExistsResponse](
            status_code=status.HTTP_200_OK,
            message="Similar Category Already Exists. You can select it.",
            data=result,
        )

    return SuccessResponse[CategoryDataResponse](
        status_code=status.HTTP_201_CREATED,
        message="Category Created Successfully",
        data=CategoryDataResponse(categories_data=result.categories_data),
    )


@news_routes.post(
    "/subcategory/custom",
    response_model=Union[
        SuccessResponse[CategoryDataResponse],
        SuccessResponse[SimilarSubcategoryExistsResponse],
        SuccessResponse[SubcategoryAlreadyExistsResponse],
    ],
    description="Allows the users to add new subcategories to the existing category.",
)
async def create_custom_subcategory(
    req: Request,
    payload: CreateCustomSubcategoryModel,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
) -> Union[
    SuccessResponse[CategoryDataResponse],
    SuccessResponse[SimilarSubcategoryExistsResponse],
    SuccessResponse[SubcategoryAlreadyExistsResponse],
]:
    user_id = decoded_token["sub"]
    pinecone_client: PineconeClient = req.app.state.pinecone_client
    result: (
        ResponseCategoryDataModel
        | SubcategoryAlreadyExistsResponse
        | SimilarSubcategoryExistsResponse
    ) = await safely_run_controllers(
        category_service.create_custom_subcategory,
        session=session,
        user_id=user_id,
        subcategory_data=payload,
        pinecone_client=pinecone_client,
    )
    if isinstance(result, SubcategoryAlreadyExistsResponse):
        return SuccessResponse[SubcategoryAlreadyExistsResponse](
            status_code=status.HTTP_200_OK,
            message="Subcategory Already Exists. You can select it.",
            data=result,
        )
    if isinstance(result, SimilarSubcategoryExistsResponse):
        return SuccessResponse[SimilarSubcategoryExistsResponse](
            status_code=status.HTTP_200_OK,
            message="Similar Subcategory Already Exists. You can select it.",
            data=result,
        )
    return SuccessResponse[CategoryDataResponse](
        status_code=status.HTTP_201_CREATED,
        message="Subcategories Added Successfully",
        data=CategoryDataResponse(categories_data=result.categories_data),
    )


@news_routes.delete(
    "/remove/category/{category_id}",
    response_model=SuccessResponse[CategoryDataResponse],
)
async def delete_custom_category(
    category_id: str,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    user_id = decoded_token["sub"]
    result: ResponseCategoryDataModel = await safely_run_controllers(
        category_service.delete_custom_category,
        user_id=user_id,
        category_id=category_id,
        session=session,
    )
    return SuccessResponse[CategoryDataResponse](
        status_code=status.HTTP_200_OK,
        message="Category deleted successfully.",
        data=CategoryDataResponse(categories_data=result.categories_data),
    )


@news_routes.delete(
    "/remove/subcategory/{subcategory_id}",
    response_model=SuccessResponse[CategoryDataResponse],
)
async def delete_custom_subcategory(
    subcategory_id: str,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    user_id = decoded_token["sub"]
    result: ResponseCategoryDataModel = await safely_run_controllers(
        category_service.delete_custom_subcategory,
        user_id=user_id,
        subcategory_id=subcategory_id,
        session=session,
    )
    return SuccessResponse[CategoryDataResponse](
        status_code=status.HTTP_200_OK,
        message="Subcategory deleted successfully.",
        data=CategoryDataResponse(categories_data=result.categories_data),
    )


@news_routes.get("/today", response_model=SuccessResponse[TodayNewsResponse])
async def get_latest_news(
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    user_id = decoded_token["sub"]
    today_news_response = await safely_run_controllers(
        news_service.get_today_news, session=session, user_id=user_id
    )
    return SuccessResponse[TodayNewsResponse](
        status_code=status.HTTP_200_OK,
        message="Returned News Successfully",
        data=today_news_response,
    )
