from pydantic import BaseModel, Field, EmailStr, ConfigDict
from uuid import UUID
from datetime import datetime


class UserCreateSchema(BaseModel):
    first_name: str = Field(alias='firstName')
    last_name: str = Field(alias='lastName')
    email: EmailStr 
    password: str  = Field(min_length=8)


class UserLogInSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=40)


class UserResponseSchema(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    role: str
    created_at: datetime

    model_config = ConfigDict(extra='ignore')


class RegisterAccountResponseSchema(BaseModel):
    data: UserResponseSchema
    message: str

class TokensSchema(BaseModel):
    access_token: str
    refresh_token: str


class AccessTokenSchema(BaseModel):
    access_token: str

