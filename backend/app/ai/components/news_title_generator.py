import json
from loguru import logger
from pydantic import BaseModel
from backend.app.ai.components.llms import UseLLMsGroq, GroqModelEnum


class NewsTitles(BaseModel):
    titles: list[str]


class NewsTitleGenerator:
    NEWS_TITLE_GENERATION_PROMPT = """
    You are expert dummy but realistic data generator in the field of AI. You will be given with an
    AI related topic. Generate {number} news titles with resembles the given AI topic. Give diverse news titles.
    It should be in the following format. 

    Topic:
    {topic}

    Output Format:
    {{
        "titles": ["title1", "title2", ...]
    }}
    The output should be the given json format. No any extra text. No explaination. No markdown format. 
    Just json string parsable using python.
    """

    def __init__(self, groq_client: UseLLMsGroq = None):
        self._client: UseLLMsGroq = (
            groq_client
            if groq_client
            else UseLLMsGroq(default_model=GroqModelEnum.GPT_OSS_120B)
        )

    async def generate_news_titles(
        self,
        topic: str,
        number: int = 20,
        model: GroqModelEnum = GroqModelEnum.GPT_OSS_120B,
        temperature: float = 0.9,
    ) -> NewsTitles:
        """Returns the ai generated news titles from given topic."""

        prompt = self.NEWS_TITLE_GENERATION_PROMPT.format(topic=topic, number=number)
        try:
            result = await self._client.chat_completion(
                prompt=prompt, model=model, temperature=temperature
            )
            news_titles_response = json.loads(result)

        except json.JSONDecodeError as exc:
            logger.error("LLM is not able to produce JSON serializable response.")
            raise exc

        result = NewsTitles(**news_titles_response)
        return result
