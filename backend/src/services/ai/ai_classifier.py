import json
from loguru import logger
from src.services.ai.components import UseLLMsGroqAsync, GroqModelEnum, UseLLMsGroqSync
from src.services.ai.models import AiClassificationResponse


def classify_news_topic_prompt(news_title: str, categories: list[str], news_description: str | None = None):
    """
    Classifies a news title into a canonical definition based on provided categories.
    """
    
    PRIMARY_PROMPT = f"""
        You are an expert taxonomy AI for a news aggregation system.
        Your task is to classify the given news title from the list of categories provided.

        ###INSTRUCTIONS:
            - Read the NEWS_TITLE and the list of CATEGORIES.
            - Refer to NEWS_DESCRIPTION if given.
            - Identify which of the CATEGORIES best fits the core topic of the NEWS_TITLE.

        ###CONFLICT AVOIDANCE / DISAMBIGUATION RULES:
            - Only consider the CATEGORIES provided as the primary taxonomy.
            - If the NEWS_TITLE overlaps with multiple categories, choose the one that captures the primary intent/impact of the news.
            
        ###RULES:
            - If the news title is nonsense or doesn't fit any known category, set "is_valid" to false.
            - Precision over Prose: Start directly with keywords. No filler like "This article is about...".
            - Return JSON only. No markdown formatting (no ```json).

        ###INPUTS:
            NEWS_TITLE: "{news_title}"
            CATEGORIES: "{', '.join(categories)}"
            NEWS_DESCRIPTION: "{news_description}"

        ###OUTPUT FORMAT:
            {{
                "is_valid": ....,
                "category": "..."
            }}
    """
    return PRIMARY_PROMPT


class AiNewsClassifierAsync:
    def __init__(self, groq_client: UseLLMsGroqAsync = None):
        self._client: UseLLMsGroqAsync = (
            groq_client
            if groq_client
            else UseLLMsGroqAsync(default_model=GroqModelEnum.GPT_OSS_120B)
        )

    async def classify(
        self,
        topic: str,
        categories: list[str],
        news_description: str | None = None,
        model: GroqModelEnum = GroqModelEnum.GPT_OSS_120B,
        temperature: float = 0.9,
    ) -> AiClassificationResponse:
        """Returns the ai generated canonical name from given topic."""
        prompt = classify_news_topic_prompt(
            news_title=topic,
            categories=categories,
            news_description=news_description,
        )   
        try:
            result = await self._client.chat_completion(
                prompt=prompt, model=model, temperature=temperature
            )
            result = result.replace("json", "").replace("```", "")
            response = json.loads(result)

        except json.JSONDecodeError as exc:
            logger.error("LLM is not able to produce JSON serializable response.")
            logger.error(f"LLM Response: {result}")
            raise exc

        result = AiClassificationResponse(**response)
        logger.info(f"Title: {topic}, result: {result}")
        return result




class TopicDescriptionGeneratorSync:
    def __init__(self, groq_client: UseLLMsGroqSync = None):
        self._client: UseLLMsGroqSync = (
            groq_client
            if groq_client
            else UseLLMsGroqSync(default_model=GroqModelEnum.GPT_OSS_120B)
        )

    def classify(
        self,
        topic: str,
        categories: list[str],
        news_description: str | None = None,
        model: GroqModelEnum = GroqModelEnum.GPT_OSS_120B,
        temperature: float = 0.9,
    ) -> AiClassificationResponse:
        """Returns the ai generated canonical name from given topic."""
        prompt = classify_news_topic_prompt(
            news_title=topic,
            categories=categories,
            news_description=news_description,
        )   
        try:
            result = self._client.chat_completion(
                prompt=prompt, model=model, temperature=temperature
            )
            result = result.replace("json", "").replace("```", "")
            response = json.loads(result)

        except json.JSONDecodeError as exc:
            logger.error("LLM is not able to produce JSON serializable response.")
            logger.error(f"LLM Response: {result}")
            raise exc

        result = AiClassificationResponse(**response)
        logger.info(f"Title: {topic}, result: {result}")
        return result