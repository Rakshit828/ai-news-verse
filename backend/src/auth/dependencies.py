from fastapi import Request, Depends, WebSocket, WebSocketException, status
from fastapi.security import APIKeyCookie
from sqlalchemy.ext.asyncio.session import AsyncSession


from src.db.schemas import Users
from src.db.dependencies import get_session
from src.auth.utils import decode_jwt_tokens
from src.services.auth import AuthService
from src.auth.exceptions import (
    InvalidJWTTokenError,
    UserNotFoundError,
    PermissionDeniedError,
)
from src.response import AppError


auth_service = AuthService()


class RefreshTokenBearer(APIKeyCookie):
    def __init__(self):
        super().__init__(name="refresh_token", auto_error=False)

    async def __call__(self, request: Request):
        refresh_token = await super().__call__(request=request)
        if refresh_token is None:
            raise AppError(InvalidJWTTokenError())
        decoded_token = decode_jwt_tokens(jwt_token=refresh_token)
        return decoded_token


class AccessTokenBearer(APIKeyCookie):
    def __init__(self):
        super().__init__(name="access_token", auto_error=False)

    async def __call__(self, request: Request):
        access_token = await super().__call__(request=request)
        if access_token is None:
            raise AppError(InvalidJWTTokenError())
        decoded_token = decode_jwt_tokens(jwt_token=access_token)
        return decoded_token



class AccessTokenBearerForWS:
    def __init__(self, cookie_name: str = "access_token"):
        self.cookie_name = cookie_name

    async def __call__(self, websocket: WebSocket):
        token = websocket.cookies.get(self.cookie_name)

        if not token:
            raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

        try:
            return decode_jwt_tokens(token)
        
        except AppError:
            raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)


async def get_current_user(
    session: AsyncSession = Depends(get_session),
    token_data=Depends(AccessTokenBearer()),
):
    user_uid = token_data["sub"]
    result = await auth_service.get_user_by_uuid(user_uid, session)
    if result is not None:
        return result

    raise AppError(UserNotFoundError())


class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: Users = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise AppError(PermissionDeniedError())


admin_checker = RoleChecker(["admin"])
