from fastapi import APIRouter, Depends, status, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio.session import AsyncSession
from datetime import datetime

from src.domains.auth.dependencies import AccessTokenBearer, AccessTokenBearerForWS
from src.domains.news.models import (
    SetUsersCategoryModel,
    CategoriesDataResponse,
    PaginatedGetNewsResponse,
)
from src.domains.news.repository import NewsArticleRepository, NewsCategoryRepository
from src.utils import safely_run_controllers
from src.services.notification_system import PubSubSystem, get_pubsub_system
from src.db.dependencies import get_session
from src.db.main import Session
from src.response import SuccessResponse
from loguru import logger

news_routes = APIRouter()


@news_routes.websocket("/ws/livenews")
async def websocket_endpoint(
    websocket: WebSocket,
    token_data=Depends(AccessTokenBearerForWS()),
    category_repo: NewsCategoryRepository = Depends(NewsCategoryRepository),
    pubsub: PubSubSystem = Depends(get_pubsub_system),
):
    user_id = token_data["sub"]
    logger.debug(f"Client {user_id} is trying to connect.")
    await websocket.accept()
    logger.info(f"Client with id: {user_id} connected successfully.")

    async with Session() as session:
        subcategory_ids: list[str] = await safely_run_controllers(
            func=category_repo.get_user_subcategories_id,
            user_id=user_id,
            session=session,
        )

    try:
        await pubsub.listen_multiple(channels=subcategory_ids, websocket=websocket)
    except WebSocketDisconnect:
        logger.info(f"Client with user_id: {user_id} disconnected.")

    except Exception as e:
        logger.error(str(e))
    finally:
        if not websocket.client_state.name == "DISCONNECTED":
            await websocket.close()


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


@news_routes.put(
    "/category",
    response_model=SuccessResponse[CategoriesDataResponse],
)
async def update_user_categories(
    categories_data: SetUsersCategoryModel,
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
    category_repo: NewsCategoryRepository = Depends(NewsCategoryRepository),
) -> SuccessResponse[CategoriesDataResponse]:
    user_id = decoded_token["sub"]
    await safely_run_controllers(
        category_repo.set_user_categories,
        session=session,
        user_id=user_id,
        categories_data=categories_data,
    )
    updated_categories: CategoriesDataResponse = await safely_run_controllers(
        category_repo.get_categories_data_of_user, user_id=user_id, session=session
    )
    return SuccessResponse[CategoriesDataResponse](
        status_code=status.HTTP_200_OK,
        message="Categories Updated Successfully.",
        data=updated_categories,
    )


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


@news_routes.get("/today", response_model=SuccessResponse[PaginatedGetNewsResponse])
async def get_latest_news(
    cutoff: int,
    subcats: list[str] | None = Query(None),
    sources: list[str] | None = Query(None),
    limit: int | None = Query(None, le=20),
    id: str | None = Query(None),
    next_published_on: datetime | None = Query(None),
    decoded_token=Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
    category_repo: NewsCategoryRepository = Depends(NewsCategoryRepository),
    article_repo: NewsArticleRepository = Depends(NewsArticleRepository),
):
    user_id = decoded_token["sub"]
    next_cursor = {}
    if id is not None and next_published_on is not None:
        next_cursor.update({"id": id, "next_published_on": next_published_on})
    
    logger.info(f"Next cursor: {next_cursor}")
    
    if subcats is None:
        subcats = await category_repo.get_user_subcategories_id(
            user_id=user_id, session=session
        )
        if subcats is None:
            raise Exception("Please define subcategories.")

    today_news_response: PaginatedGetNewsResponse | None = await safely_run_controllers(
        article_repo.get_news,
        session=session,
        cutoff_hours=cutoff,
        sources=sources,
        subcategory_ids=subcats,
        limit=limit,
        next_cursor=next_cursor,
    )
    return SuccessResponse[PaginatedGetNewsResponse | None](
        status_code=status.HTTP_200_OK,
        message="Returned News Successfully",
        data=today_news_response,
    )
