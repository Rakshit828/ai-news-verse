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
        Your goal is to normalize vague or specific user interests into a "Canonical Topic Definition" that will be used for vector database retrieval.

        ### INSTRUCTIONS:
        1. Analyze the USER_INPUT.
        2. Identify the core subject matter (Entity, Technology, Field, or Event).
        3. Generate a "Canonical Name": Use standard, professional title-casing (e.g., convert "react js" -> "React.js Framework").
        4. Generate a "Dense Description": A paragraph containing synonyms, related entities, strict keywords, and context. This description is optimized for **semantic similarity matching**.
        5. Return **JSON** only.

        ### RULES:
        - If the input is nonsense (e.g. "asdf"), return "is_valid": false.
        - The "description" must be rich in keywords to ensure a high match score against relevant news titles.
        - Do NOT hallucinate specific news events. Describe the *category* of news.

        ### EXAMPLES:

        Input: "stocks and market stuff"
        Output:
        {{
        "is_valid": true,
        "canonical_name": "Stock Market & Finance",
        "description": "Financial markets, wall street, stock exchanges (NYSE, NASDAQ), global economy, trading updates, S&P 500, Dow Jones, cryptocurrency trends, and investment banking news."
        }}

        Input: "musk starship"
        Output:
        {{
        "is_valid": true,
        "canonical_name": "SpaceX Starship Program",
        "description": "Aerospace engineering updates regarding SpaceX, Elon Musk, the Starship launch vehicle, Super Heavy booster, Raptor engines, orbital flight tests, FAA regulations, and Mars colonization efforts."
        }}

        ### ACTUAL TASK:
        USER_INPUT: "{user_input}"

        Return JSON only. **Do not use markdown format**. Just json.
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
            result = result.replace("json", "").replace('```', '')
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
            result = result.replace("json", "").replace('```', '')
            news_titles_response = json.loads(result)

        except json.JSONDecodeError as exc:
            logger.error("LLM is not able to produce JSON serializable response.")
            logger.error(f"LLM Response: {result}")
            raise exc

        result = TopicDescription(**news_titles_response)
        logger.info(f"Generated topic description for topic: {topic}, result: {result}")
        return result
