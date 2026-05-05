Here is the backend API for getting the news. Update the API calling logic with the UI improvement as well. THis API has full pagination support. Put down the logic of calling the API and also make the infinite scrolling UI.

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


class NewsResponse(BaseModel):
    id: str
    title: str
    url: str
    source: Source
    summary: Optional[str]
    published_on: datetime
    metadatas: Optional[Dict]
    featured_image: Optional[str]
    subcategory: SubCategory

class SubCategory(BaseModel):
    subcategory_id: UUID = Field(alias="id")
    name: str

    model_config = ConfigDict(from_attributes=True)

class PaginatedGetNewsResponse(BaseModel):
    limit: int = Field(default=10)
    next_cursor: dict | None = None
    news: List[NewsResponse]

According to this response type, desing everytype of compatible news cards. It should be compatible when there is no summary or where there is no featured image. Ignore the metadata field for now. 
Make the UI fully compatible, smooth, and responsive as well.