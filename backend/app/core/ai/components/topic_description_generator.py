import json
from loguru import logger
import uuid
from pydantic import BaseModel
from app.core.ai.components.llms import UseLLMsGroq, GroqModelEnum


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
        Your task is to normalize a user's interest into a single "Canonical Topic Definition" optimized for high-precision classification and vector-based retrieval.

        ###INSTRUCTIONS:
            -Read the USER_INPUT.
            -Identify the single core topic (entity, technology, field, or event category).
            -Review OTHER TOPICS TO CONSIDER carefully.
            -Generate a "canonical_name": A standard professional title in Title Case.
            -Generate a "description": A dense, comprehensive summary (2–3 sentences) that defines the topic’s scope.
            -Include only established technical terms, directly related entities, and primary sub-categories.
            -Ensure every word adds semantic value for vector search.
            -STICK TO THE TOPIC: Do not branch into neighboring or overlapping fields unless they are intrinsic.

        ###CONFLICT AVOIDANCE / DISAMBIGUATION RULES:
            -The OTHER TOPICS list represents nearby or competing classifications.
            -Your output MUST clearly distinguish the USER_INPUT topic from those topics.
            -Do NOT reuse keywords, entities, or subdomains that belong primarily to OTHER TOPICS.
            -If the USER_INPUT could be confused with another topic, explicitly narrow the scope to the correct interpretation.
            -The goal is to generate embeddings that cluster ONLY with the intended topic, not with the OTHER TOPICS.

        ###RULES:
            -If the input is nonsense or meaningless, give "is_valid" parameter false.
            -Precision over Prose: Avoid introductory filler like "This topic covers..." or "News about...". Start directly with keywords.
            -No Hallucination: Do not invent specific recent events, headlines, or speculative future claims. Use only persistent, factual attributes.
            -No Filler: Avoid generic words like "various," "interesting," or "related."
            -No Topic Blending: Do not merge multiple domains into one definition.

        ###OUTPUT FORMAT:
            {{
                "is_valid": true,
                "canonical_name": "...",
                "description": "..."
            }}

        ###EXAMPLES:

            Input: "stocks and market stuff"
            Other Topics: "Cryptocurrency, Banking Regulation"
            Output:
            {{
                "is_valid": true,
                "canonical_name": "Equity Markets & Global Finance",
                "description": "Publicly traded securities, stock exchange operations, and equity price discovery mechanisms. Includes major indexes such as the S&P 500, NASDAQ, and Dow Jones, alongside institutional trading, brokerage infrastructure, and oversight by regulators such as the SEC."
            }}

            Input: "musk starship"
            Other Topics: "Blue Origin, NASA Space Launch System"
            Output:
            {{
                "is_valid": true,
                "canonical_name": "SpaceX Starship Program",
                "description": "Development and flight testing of SpaceX’s fully reusable Starship launch vehicle and Super Heavy booster. Focuses on Raptor engine systems, Starbase orbital launch operations, and mission architecture for interplanetary transport and NASA Artemis Human Landing System integration."
            }}

        ###ACTUAL TASK:
            USER_INPUT: "{user_input}"
            OTHER TOPICS TO CONSIDER: "{other_topics}"

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
    ) -> CanonicalName:
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
        other_topics: list[str],
        model: GroqModelEnum = GroqModelEnum.GPT_OSS_120B,
        temperature: float = 0.9,
    ) -> TopicDescription:
        """Returns the ai generated news titles from given topic."""

        logger.info(f"Generating topic description for topic: {topic}, using {model}")

        prompt = self.PRIMARY_PROMPT.format(user_input=topic, other_topics=other_topics)
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
