from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Literal, Union
from src.services.ai.models import VDBClassificationResponse
from pydantic import BaseModel, ConfigDict


class BaseArticle(BaseModel):
    guid: str = Field(description="The url of the article source itself", alias="id")
    title: str
    description: str | None = None
    url: str = Field(alias="link")
    published_on: datetime = Field(alias="published_time")
    summary: str | None = None # This includes AI Generated Summary
    featured_image: str | None = None
    markdown_content: str | None = None
    classification: VDBClassificationResponse

    model_config = ConfigDict(extra="allow")


class ServiceArticle(BaseArticle):
    source: Literal["OPENAI", "GOOGLE", "ANTHROPIC", "HACKERNOON"]


class OpenAIScrapedData(BaseModel):
    id: str 
    title: str
    link: str 
    idislink: bool = True
    markdown_content: str | None = None
    featured_image: str | None = None 
    published_time: datetime

    model_config = ConfigDict(arbitrary_types_allowed=True)

class AnthropicScrapedData(BaseModel):
    id: str 
    title: str
    description: str
    link: str 
    idislink: bool = True
    markdown_content: str | None = None
    featured_image: str | None = None 
    published_time: datetime

    model_config = ConfigDict(arbitrary_types_allowed=True)

class HackerNoonScrapedData(BaseModel):
    id: str
    title: str 
    author: str 
    link: str 
    markdown_content: str | None = None
    featured_image: str | None = None 
    published_time: datetime

    idislink: bool = True

    model_config = ConfigDict(arbitrary_types_allowed=True)

class GoogleSource(BaseModel):
    href: str
    title: str 

class GoogleScrapedData(BaseModel):
    id: str 
    title: str 
    link: str 
    category: str 
    published_time: datetime
    news_source: GoogleSource
    markdown_content: str | None = None
    featured_image: str | None = None 
    idislink: bool = False


class MitAiScrapedData(BaseModel):
    id: str 
    title: str 
    description: str 
    link: str 
    markdown_content: str | None = None
    featured_image: str | None = None 
    published_time: datetime
    markdown_content: str | None = None
    featured_image: str | None = None 
    idislink: bool = True
    
    
    model_config = ConfigDict(arbitrary_types_allowed=True)



type ScrapedData = Union[
    OpenAIScrapedData,
    AnthropicScrapedData,
    HackerNoonScrapedData,
    GoogleScrapedData,
    MitAiScrapedData,
]