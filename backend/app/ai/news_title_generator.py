import groq
import json
from loguru import logger

from app.config import CONFIG


class NewsTitles:
    category: str
    titles: list[str]

class NewsTitleGenerator:
    PROMPT = """
    You are expert dummy but realistic data generator in the field of AI. You will be given with an
    AI related topic. Generate {number} news titles with resembles the given AI topic. It should be in
    the following format. 

    Topic:
    {topic}

    Output Format:
    {{
        "titles": ["title1", "title2", ...]
    }}
    The output should be the given json format. No any extra text. No explaination. No markdown format. 
    Just json string parsable using python.
    """

    def __init__(self, groq_client: groq.Groq = None):
        self.client: groq.Groq = (
            groq_client if groq_client else groq.Groq(api_key=CONFIG.GROQ_API_KEY)
        )



    async def generate_news_titles(
        self, topic: str, number: int = 20
    ) -> NewsTitles:
        """Returns the ai generated news titles from given topic.
        """

        prompt = self.PROMPT.format(
            topic=topic, number=number
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
            print("AI : ", chat_completion.choices[0].message.content)
            classified_response = json.loads(chat_completion.choices[0].message.content)

        except groq._exceptions.RateLimitError as e:
            logger.error("Rate limit reaced for groq", str(e))
            raise groq.RateLimitError()

        except json.JSONDecodeError:
            raise ValueError("Unable to decode the json")

        result = NewsTitles(**classified_response)
        return result
