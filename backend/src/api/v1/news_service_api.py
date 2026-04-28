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

from src.domains.auth.dependencies import AccessTokenBearer, AccessTokenBearerForWS
from src.domains.news.models import SetUsersCategoryModel, UpdateUsersCategoryModel
from src.domains.news.models import CategoriesDataResponse, SetUsersCategoryModel

# from src.domains.news.repository import Newsre
from src.domains.news.repository import NewsArticleRepository, NewsCategoryRepository
from src.services.ai.components.pinecone_db import PineconeServiceAsync
from src.utils import safely_run_controllers
from src.services.notification_system import PubSubSystem, get_pubsub_system
from src.db.dependencies import get_session
from src.db.main import Session
from src.response import SuccessResponse
from loguru import logger


news_routes = APIRouter()


# @news_routes.websocket("/ws/livenews")
# async def websocket_endpoint(
#     websocket: WebSocket,
#     token_data=Depends(AccessTokenBearerForWS()),
#     pubsub: PubSubSystem = Depends(get_pubsub_system)
# ):
#     user_id = token_data["sub"]
#     logger.debug(f"Client {user_id} is trying to connect.")
#     await websocket.accept()
#     logger.info(f"Client with id: {user_id} connected successfully.")

#     async with Session() as session:
#         categories_data: CategoriesDataResponse = await safely_run_controllers(
#             func=
# category_repo.get_user_categories, user_id=user_id, session=session
#         )

#     # Channels is a list of the user subcategories ids.
#     channels: list[str] = [
#         str(subcategory.subcategory_id)
#         for category in categories_data.categories_data
#         for subcategory in category.subcategories
#     ]

#     try:
#         await pubsub.listen_multiple(channels=channels, websocket=websocket)
#     except WebSocketDisconnect:
#         logger.info(f"Client with user_id: {user_id} disconnected.")

#     except Exception as e:
#         logger.error(str(e))
#     finally:
#         if not websocket.client_state.name == "DISCONNECTED":
#             await websocket.close()


@news_routes.get(
    "/category",
    response_model=SuccessResponse[CategoriesDataResponse],
    description="Returs the existing categories in the database to select from to show in UI.",
)
async def get_initial_category_data(
    session: AsyncSession = Depends(get_session),
    category_repo: NewsCategoryRepository = Depends(NewsCategoryRepository),
) -> SuccessResponse[CategoriesDataResponse]:
    category_data: CategoriesDataResponse = await safely_run_controllers(
        category_repo.get_categories_data, session=session
    )
    return SuccessResponse[CategoriesDataResponse](
        status_code=status.HTTP_200_OK,
        message="Returned Categories Successfully.",
        data=CategoriesDataResponse(categories=category_data.categories),
    )


@news_routes.post("/category", response_model=SuccessResponse[CategoriesDataResponse])
async def set_user_categories(
    categories_data: SetUsersCategoryModel,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
    category_repo: NewsCategoryRepository = Depends(NewsCategoryRepository),
) -> SuccessResponse[CategoriesDataResponse]:
    user_id = decoded_token["sub"]
    result = await safely_run_controllers(
        category_repo.set_user_categories,
        session=session,
        user_id=user_id,
        categories_data=categories_data,
    )
    updated_categories: CategoriesDataResponse = await safely_run_controllers(
        category_repo.get_categories_data_of_user, user_id=user_id, session=session
    )

    return SuccessResponse[CategoriesDataResponse](
        status_code=status.HTTP_201_CREATED,
        message="Categories Set Successfully.",
        data=CategoriesDataResponse(categories=updated_categories.categories),
    )


# @news_routes.put(
#     "/category",
#     response_model=SuccessResponse[CategoriesDataResponse],
# )
# async def update_user_categories(
#     categories_data: UpdateUsersCategoriesModel,
#     decoded_token=Depends(AccessTokenBearer()),
#     session: AsyncSession = Depends(get_session),
# ) -> SuccessResponse[CategoriesDataResponse]:
#     user_id = decoded_token["sub"]
#     result: CategoriesDataResponse = await safely_run_controllers(
#
# category_repo.update_user_categories,
#         session=session,
#         user_id=user_id,
#         categories_data=categories_data,
#     )
#     return SuccessResponse[CategoriesDataResponse](
#         status_code=status.HTTP_201_CREATED,
#         message="Categories Set Successfully.",
#         data=CategoriesDataResponse(categories_data=result.categories_data),
#     )


@news_routes.get(
    "/category/me",
    response_model=SuccessResponse[CategoriesDataResponse],
)
async def get_user_categories(
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
    category_repo: NewsCategoryRepository = Depends(NewsCategoryRepository),
) -> SuccessResponse[CategoriesDataResponse]:
    user_id = decoded_token["sub"]
    result: CategoriesDataResponse = await safely_run_controllers(
        category_repo.get_categories_data_of_user, session=session, user_id=user_id
    )
    return SuccessResponse[CategoriesDataResponse](
        status_code=status.HTTP_200_OK,
        message="Returned Categories Successfully",
        data=CategoriesDataResponse(categories=result.categories),
    )


@news_routes.delete(
    "/remove/category/{subcategory_id}",
    response_model=SuccessResponse[CategoriesDataResponse],
)
async def delete_custom_category(
    subcategory_id: str,
    decoded_token=Depends(AccessTokenBearer()),
    category_repo: NewsCategoryRepository = Depends(NewsCategoryRepository),
    session: AsyncSession = Depends(get_session),
):
    user_id = decoded_token["sub"]
    await safely_run_controllers(
        category_repo.delete_user_subcategories,
        user_id=user_id,
        subcategory_ids=[subcategory_id],
        session=session,
    )
    return SuccessResponse[None](
        status_code=status.HTTP_204_NO_CONTENT,
        message="Category deleted successfully.",
        data=None,
    )


# @news_routes.get("/today", response_model=SuccessResponse[TodayNewsResponse])
# async def get_latest_news(
#     decoded_token=Depends(AccessTokenBearer()),
#     session: AsyncSession = Depends(get_session),
# ):
#     user_id = decoded_token["sub"]
#     today_news_response = await safely_run_controllers(
#         news_service.get_today_news, session=session, user_id=user_id
#     )
#     return SuccessResponse[TodayNewsResponse](
#         status_code=status.HTTP_200_OK,
#         message="Returned News Successfully",
#         data=today_news_response,
#     )
