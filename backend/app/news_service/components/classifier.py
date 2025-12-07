import groq
import json
import asyncio
from loguru import logger
from typing import Optional

from app.news_service.types import CategoriesData, ClassifiedCategory
from app.database.services.ai_news_service import AiNewsService
from app.database.main import get_session
from app.config import CONFIG


class Classifier:
    CLASSIFY_CATEGORY_PROMPT = """
        You are an AI assistant for classifying AI news.

        Task:
        Given a news **TITLE**, return the closest matching **category** and **subcategory** from **CATEGORY_DATA**.
        Also you have to give score for your classification.

        Rules:

        1. Use only entries from **CATEGORY_DATA**.
        2. Output **strict JSON only**, following the structure below. Do not even include the markdown json format. Give just json.
        3. No explanations or extra text.
        4. If multiple matches exist, choose the single closest match.

        Input:
        TITLE: `{title}`
        CATEGORY_DATA: `{category_data}`

        Output (exact structure):
        {{
        "category": {{ "category_id": "sectors", "title": "Sector-Specific" }},
        "subcategory": {{ "subcategory_id": "ai-healthcare", "title": "Healthcare" }}
        "category_confidence": 0.98
        "subcategory_confidence": 0.88
        }}
    """

    def __init__(self, groq_client: groq.Groq = None, db: AiNewsService = None):
        self.client: groq.Groq = (
            groq_client if groq_client else groq.Groq(api_key=CONFIG.GROQ_API_KEY)
        )
        self.categories_data: CategoriesData | None = None
        self.db = db if isinstance(db, AiNewsService) else AiNewsService()

    async def set_category_to_none(self):
        self.categories_data = None

    async def _fetch_category_data(self) -> None:
        """Fetches and updates the categories_data property."""
        async for session in get_session():
            categories_data = await self.db.get_categories_data(session=session)
            self.categories_data = categories_data
            return None

    async def classify_category(
        self, news_title: str, categories_data: Optional[CategoriesData] = None
    ) -> ClassifiedCategory:
        """Classifies the News Title and returns the response returned by AI model as
        ```python ClassifiedCategory
        """
        await asyncio.sleep(1)
        final_category_data: CategoriesData = None
        if categories_data:
            final_category_data = categories_data
        elif self.categories_data is None:
            await self._fetch_category_data()
            final_category_data = self.categories_data
        final_category_data = self.categories_data

        prompt = self.CLASSIFY_CATEGORY_PROMPT.format(
            title=news_title, category_data=final_category_data
        )
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="openai/gpt-oss-120b",  # llama-3.3-70b-versatile,
            )
        except groq._exceptions.RateLimitError as e:
            logger.error("Rate limit reaced for groq", str(e))

        try:
            print("AI : ", chat_completion.choices[0].message.content)
            classified_response = json.loads(chat_completion.choices[0].message.content)
        except json.JSONDecodeError:
            raise ValueError("Unable to decode the json")

        category = ClassifiedCategory(**classified_response)
        return category
