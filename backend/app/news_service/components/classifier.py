import json
import asyncio
from loguru import logger
from typing import Optional

from app.news_service.types import CategoriesData, ClassifiedCategory
from app.ai.llms import UseLLMsGroq, GroqModelEnum


class CategoryClassifier:
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

    def __init__(
        self, categories_data: CategoriesData, groq_client: UseLLMsGroq = None
    ):
        self._client: UseLLMsGroq = (
            groq_client
            if groq_client
            else UseLLMsGroq(default_model=GroqModelEnum.GPT_OSS_120B)
        )
        self.categories_data: CategoriesData = categories_data

    async def run(
        self,
        news_title: str,
        model: GroqModelEnum = GroqModelEnum.GPT_OSS_120B,
        categories_data: Optional[CategoriesData] = None,
        temperature: float = 0.9,
    ) -> ClassifiedCategory:
        """Classifies the News Title and returns the response returned by AI model as
        ```python ClassifiedCategory
        """
        await asyncio.sleep(1)  # To avoid rate limiting errors
        final_category_data: CategoriesData = (
            categories_data if categories_data is not None else self.categories_data
        )

        prompt = self.CLASSIFY_CATEGORY_PROMPT.format(
            title=news_title, category_data=final_category_data
        )

        try:
            result = await self._client.chat_completion(
                prompt=prompt, model=model, temperature=temperature
            )
            classified_response = json.loads(result)
        except json.JSONDecodeError as e:
            logger.error("LLM is not able to produce JSON serializable response.")
            raise e

        category = ClassifiedCategory(**classified_response)
        return category
