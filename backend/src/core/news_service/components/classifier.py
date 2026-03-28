import json
import asyncio
from loguru import logger
from typing import Optional

from src.core.news_service.types import CategoriesData
from src.core.ai.components.llms import UseLLMsGroqAsync, GroqModelEnum

class AiCategoryClassifier:
    CLASSIFY_CATEGORY_PROMPT = """
        You are an AI assistant for classifying AI news.

        Task:
        Given a news **TITLE**, return the closest matching **category title** and **subcategory title** from **CATEGORY_DATA**.
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
        "category": {{ "category_id": "98cd534e-65f9-454f-9d8c-1956a3858be8", "title": "Sector-Specific" }},
        "subcategory": {{ "subcategory_id": "875f09de-8339-4054-8ec1-d633bb57e6ee", "title": "Healthcare" }}
        "category_confidence": 0.98
        "subcategory_confidence": 0.88
        }}
    """

    def __init__(
        self, categories_data: CategoriesData, groq_client: UseLLMsGroqAsync = None
    ):
        self._client: UseLLMsGroqAsync = (
            groq_client
            if groq_client
            else UseLLMsGroqAsync(default_model=GroqModelEnum.GPT_OSS_120B)
        )
        self.categories_data: CategoriesData = categories_data

    async def run(
        self,
        news_title: str,
        model: GroqModelEnum = GroqModelEnum.GPT_OSS_120B,
        categories_data: Optional[CategoriesData] = None,
        temperature: float = 0.9,
    ) -> dict:
        """Classifies the News Title and returns the response returned by AI model as
        ```python
        """
        await asyncio.sleep(3)  # To avoid rate limiting errors
        final_category_data: CategoriesData = (
            categories_data if categories_data is not None else self.categories_data
        )

        prompt = self.CLASSIFY_CATEGORY_PROMPT.format(
            title=news_title, category_data=final_category_data
        )

        logger.debug(f"\nPrompt: {prompt}")

        try:
            result = await self._client.chat_completion(
                prompt=prompt, model=model, temperature=temperature
            )
            classified_response = json.loads(result)

            logger.debug(f"\n\nClassification Response AI: {classified_response}")

        except json.JSONDecodeError as e:
            logger.error("LLM is not able to produce JSON serializable response.")
            raise e

        return classified_response
