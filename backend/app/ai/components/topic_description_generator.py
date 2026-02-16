import json
from loguru import logger
import uuid
from pydantic import BaseModel
from app.ai.components.llms import UseLLMsGroq, GroqModelEnum


class TopicDescription(BaseModel):
    is_valid: bool
    canonical_name: str
    description: str


class CanonicalName(BaseModel):
    is_valid: bool
    canonical_name: str


class TopicDescriptionGenerator:
    PRIMARY_PROMPT = """
        You are an expert taxonomy AI for a news aggregation system.
        Your task is to normalize a user's vague or specific interest into a short, highly relevant "Canonical Topic Definition" for accurate classification and vector retrieval.

        ### INSTRUCTIONS:
        1. Read the USER_INPUT.
        2. Identify the single core topic (entity, technology, field, or event category).
        3. Generate a "canonical_name": a standard professional title (Title Case).
        4. Generate a "description": 1 short, keyword-dense sentence with only directly related synonyms, entities, and context.
        5. Return JSON only.

        ### RULES:
        - If the input is nonsense or meaningless, return:
        {{"is_valid": false}}
        - Keep the description short, precise, and strictly on-topic.
        - Do NOT include unrelated or broad extra concepts.
        - Do NOT hallucinate specific news events or headlines.
        - Focus only on the general category for semantic matching.

        ### OUTPUT FORMAT:
        {{
        "is_valid": true,
        "canonical_name": "...",
        "description": "..."
        }}

        ### EXAMPLES:

        Input: "stocks and market stuff"
        Output:
        {{
        "is_valid": true,
        "canonical_name": "Stock Market & Finance",
        "description": "Stock markets, trading, major indexes (S&P 500, NASDAQ), equities, investment news, and global financial updates."
        }}

        Input: "musk starship"
        Output:
        {{
        "is_valid": true,
        "canonical_name": "SpaceX Starship Program",
        "description": "SpaceX Starship development, launch testing, Super Heavy booster, Raptor engines, and aerospace regulation updates."
        }}

        ### ACTUAL TASK:
        USER_INPUT: "{user_input}"

        Return JSON only. No markdown. No extra text.
    """

    CANONICAL_NAME_ONLY_PROMPT = """
        You are an expert taxonomy AI for a news aggregation system. 
        Your goal is to normalize vague or specific user interests into a "Canonical Topic Definition" that will be used for vector database retrieval.

        ### INSTRUCTIONS:
        1. Analyze the USER_INPUT.
        2. Identify the core subject matter (Entity, Technology, Field, or Event).
        3. Generate a "Canonical Name": Use standard, professional title-casing (e.g., convert "react js" -> "React.js Framework").
        4. Return **JSON** only.

        ### RULES:
        - If the input is nonsense (e.g. "asdf"), return "is_valid": false.
        - Do NOT hallucinate specific news events. Describe the *category* of news.

        ### EXAMPLES:

        Input: "stocks and market stuff"
        Output:
        {{
        "is_valid": true,
        "canonical_name": "Stock Market & Finance",
        }}

        Input: "musk starship"
        Output:
        {{
        "is_valid": true,
        "canonical_name": "SpaceX Starship Program",
        }}

        ### ACTUAL TASK:
        USER_INPUT: "{user_input}"

        Return JSON only. **Do not use markdown format**. Just json.
        
    """

    def __init__(self, groq_client: UseLLMsGroq = None):
        self._client: UseLLMsGroq = (
            groq_client
            if groq_client
            else UseLLMsGroq(default_model=GroqModelEnum.GPT_OSS_120B)
        )

    async def generate_canonical_name(
        self,
        topic: str,
        model: GroqModelEnum = GroqModelEnum.GPT_OSS_120B,
        temperature: float = 0.9,
    ) -> TopicDescription:
        """Returns the ai generated canonical name from given topic."""

        logger.info(f"Generating canonical name for topic: {topic}, using {model}")

        prompt = self.CANONICAL_NAME_ONLY_PROMPT.format(user_input=topic)
        try:
            result = await self._client.chat_completion(
                prompt=prompt, model=model, temperature=temperature
            )
            result = result.replace("json", "").replace("```", "")
            canonical_name_response = json.loads(result)

        except json.JSONDecodeError as exc:
            logger.error("LLM is not able to produce JSON serializable response.")
            logger.error(f"LLM Response: {result}")
            raise exc

        result = CanonicalName(**canonical_name_response)
        logger.info(f"Generated canonical name for topic: {topic}, result: {result}")
        return result

    async def generate_topic_description(
        self,
        topic: str,
        model: GroqModelEnum = GroqModelEnum.GPT_OSS_120B,
        temperature: float = 0.9,
    ) -> TopicDescription:
        """Returns the ai generated news titles from given topic."""

        logger.info(f"Generating topic description for topic: {topic}, using {model}")

        prompt = self.PRIMARY_PROMPT.format(user_input=topic)
        try:
            result = await self._client.chat_completion(
                prompt=prompt, model=model, temperature=temperature
            )
            result = result.replace("json", "").replace("```", "")
            news_titles_response = json.loads(result)

        except json.JSONDecodeError as exc:
            logger.error("LLM is not able to produce JSON serializable response.")
            logger.error(f"LLM Response: {result}")
            raise exc

        result = TopicDescription(**news_titles_response)
        logger.info(f"Generated topic description for topic: {topic}, result: {result}")
        return result
