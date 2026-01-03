import groq
import json
import asyncio
from loguru import logger
from typing import Optional, Iterable
import functools
import inspect

from app.news_service.types import CategoriesData, ClassifiedCategory
from app.config import CONFIG


def retry_on_groq_rate_limit(
    models: Iterable[str],
    max_retries: int | None = None,
):
    """
    Retries an async function on Groq RateLimitError by switching models.

    Assumptions:
    - The wrapped function is an async method
    - `self.client.chat.completions.create` accepts `model=...`
    - The wrapped function accepts `model` as a keyword argument
    """

    model_list = list(models)
    if not model_list:
        raise ValueError("At least one model must be provided")

    def decorator(func):
        if not inspect.iscoroutinefunction(func):
            raise TypeError(
                "retry_on_groq_rate_limit can only be used on async functions"
            )

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            self = args[0]
            attempts = model_list if max_retries is None else model_list[:max_retries]

            last_exc: Exception | None = None

            for i, model in enumerate(attempts):
                try:
                    return await func(*args, **kwargs)
                except groq._exceptions.RateLimitError as exc:
                    last_exc = exc
                    self.current_model = attempts[i+1]
                    logger.warning(
                        f"Groq rate limit hit for {model}. Retrying with next model: {self.current_model}"
                    )

            # All models exhausted
            logger.error("All Groq models exhausted due to rate limits")
            raise last_exc

        return wrapper

    return decorator


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

    AVAILABLE_MODELS = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "llama-3.3-70b-versatile",
    ]

    def __init__(self, categories_data: CategoriesData, groq_client: groq.Groq = None):
        self.client: groq.Groq = (
            groq_client if groq_client else groq.Groq(api_key=CONFIG.GROQ_API_KEY)
        )
        self.categories_data: CategoriesData = categories_data
        self.current_model: str = self.AVAILABLE_MODELS[0]


    @retry_on_groq_rate_limit(models=AVAILABLE_MODELS, max_retries=3)
    async def classify_category(
        self,
        news_title: str,
        categories_data: Optional[CategoriesData] = None,
    ) -> ClassifiedCategory:
        """Classifies the News Title and returns the response returned by AI model as
        ```python ClassifiedCategory
        """
        await asyncio.sleep(1)
        final_category_data: CategoriesData = (
            categories_data if categories_data is not None else self.categories_data
        )

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
                model=self.current_model
            )
            print("AI : ", chat_completion.choices[0].message.content)
            classified_response = json.loads(chat_completion.choices[0].message.content)

        except json.JSONDecodeError:
            raise ValueError("Unable to decode the json")

        category = ClassifiedCategory(**classified_response)
        return category
