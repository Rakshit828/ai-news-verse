from fastapi import APIRouter, Depends, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.database.main import get_session
from app.config import CONFIG
from app.database.services.auth import AuthService
from app.auth.dependencies import RefreshTokenBearer
from app.auth.utils import create_jwt_tokens
from app.database.schemas.auth import (
    UserCreateSchema,
    UserResponseSchema,
    UserLogInSchema,
)
from app.response import AppError, SuccessResponse
from app.auth.exceptions import InvalidTokenSchemaError


def set_tokens_dev(response: Response, tokens_dict: dict[str, str]):
    token_keys: set[str] = { "access_token", "refresh_token" }
    if not tokens_dict.keys():
        raise AppError(InvalidTokenSchemaError(message="Empty token schema in setting of the tokens in cookies."))
    for key in tokens_dict.keys():
        if key not in token_keys:
            raise AppError(InvalidTokenSchemaError(message=f"Invalid token schema : Schema is {tokens_dict}"))
        response.set_cookie(
            path="/",
            key=key,
            value=tokens_dict.get(key),
            httponly=True,
            secure=False,
            samesite='lax',
            max_age=REFRESH_TOKEN_EXPIRY_SECONDS if key == "refresh_token" else ACCESS_TOKEN_EXPIRY_SECONDS
        )

def set_tokens_production(response: Response, tokens_dict: dict[str, str]):
    token_keys: set[str] = { "access_token", "refresh_token" }
    if not tokens_dict.keys():
        raise AppError(InvalidTokenSchemaError(message="Empty token schema in setting of the tokens in cookies."))
    for key in tokens_dict.keys():
        if key not in token_keys:
            raise AppError(InvalidTokenSchemaError(message=f"Invalid token schema : Schema is {tokens_dict}"))
        response.set_cookie(
            path="/",
            key=key,
            value=tokens_dict.get(key),
            httponly=True,
            secure=True,
            samesite='none',
            max_age=REFRESH_TOKEN_EXPIRY_SECONDS if key == "refresh_token" else ACCESS_TOKEN_EXPIRY_SECONDS
        )

REFRESH_TOKEN_EXPIRY_SECONDS = CONFIG.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60
ACCESS_TOKEN_EXPIRY_SECONDS = CONFIG.ACCESS_TOKEN_EXPIRY_MINUTES * 60

auth_routes = APIRouter()
auth_service = AuthService()


@auth_routes.post(
    "/signup",
    response_model=SuccessResponse[UserResponseSchema],
    status_code=status.HTTP_201_CREATED,
)
async def create_account(
    user_data: UserCreateSchema,
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[UserResponseSchema]:
    user = await auth_service.make_account(user_data=user_data, session=session)
    return SuccessResponse[UserResponseSchema](
        status_code=status.HTTP_201_CREATED,
        message="Account Created Successfully",
        data=user.__dict__,
    )


@auth_routes.post("/login", response_model=SuccessResponse[UserResponseSchema])
async def login(
    response: Response,
    user_data: UserLogInSchema,
    session: AsyncSession = Depends(get_session),
):
    tokens = await auth_service.log_in_user(user_data, session)
    if CONFIG.IS_DEV:
        set_tokens_dev(response=response, tokens_dict=tokens)
    else:
        set_tokens_production(response=response, tokens_dict=tokens)
    user = await auth_service.get_user_by_email(email=user_data.email, session=session)
    return SuccessResponse[UserResponseSchema](
        message="Logged In Successfully.",
        status_code=status.HTTP_200_OK,
        data=user.__dict__
    )


@auth_routes.get("/logout", response_model=SuccessResponse[None])
async def logout_user(response: Response):
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=True,
        samesite="none",
    )
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="none",
    )
    return SuccessResponse[None](message="Logged Out Successfully")


@auth_routes.get("/refresh")
async def refresh_access_token(
    response: Response,
    token_data: dict = Depends(RefreshTokenBearer()),
) -> SuccessResponse[None]:
    user_uuid = token_data["sub"]
    role = token_data["role"]
    new_access_token = await create_jwt_tokens(
        user_uuid=user_uuid, role=role, is_login=False
    )
    if CONFIG.IS_DEV:
        set_tokens_dev(response=response, tokens_dict=new_access_token)
    else:
        set_tokens_production(response=response, tokens_dict=new_access_token)

    return SuccessResponse[None](
        message="Token Refreshed Successfully"
    )
