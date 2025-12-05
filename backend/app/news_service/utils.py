from groq import Groq
from app.config import CONFIG
import asyncio
import json
from app.news_service.types import ClassifiedCategory

client = Groq(api_key=CONFIG.GROQ_API_KEY)


CLASSIFY_CATEGORY_PROMPT = """
You are an AI assistant for classifying AI news.

Task:
Given a news **TITLE**, return the closest matching **category** and **subcategory** from **CATEGORY_DATA**.

Rules:

1. Use only entries from **CATEGORY_DATA**.
2. Output **strict JSON only**, following the structure below.
3. No explanations or extra text.
4. If multiple matches exist, choose the single closest match.

Input:
TITLE: `{title}`
CATEGORY_DATA: `{category_data}`

Output (exact structure):
{{
"category": {{ "category_id": "sectors", "title": "Sector-Specific" }},
"subcategory": {{ "subcategory_id": "ai-healthcare", "title": "Healthcare" }}
}}

"""


async def classify_category(category_data: dict, news_title: str) -> ClassifiedCategory:
    await asyncio.sleep(2)
    prompt = CLASSIFY_CATEGORY_PROMPT.format(
        title=news_title, category_data=category_data
    )
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="openai/gpt-oss-120b", # llama-3.3-70b-versatile
    )

    try:
        print("AI : ", chat_completion.choices[0].message.content)
        classified_response = json.loads(chat_completion.choices[0].message.content)
    except json.JSONDecodeError:
        raise ValueError("Unable to decode the json")

    category = ClassifiedCategory(**classified_response)
    return category


if __name__ == "__main__":
    CATEGORY_DATA = {
        "categories": [
            {
                "id": "core",
                "title": "Core AI News",
                "subcategories": [
                    {"id": "ai-industry", "title": "Industry News"},
                    {"id": "ai-research", "title": "Research"},
                    {"id": "ai-policy", "title": "Policy & Regulation"},
                    {"id": "ai-saftey", "title": "AI Saftey"},
                    {"id": "ai-product-launches", "title": "Recent AI products"},
                ],
            },
            {
                "id": "technical",
                "title": "Technical Part of AI",
                "subcategories": [
                    {"id": "llm", "title": "LLMs"},
                    {"id": "cv", "title": "Computer Vision"},
                    {"id": "genai", "title": "Generative AI"},
                ],
            },
            {
                "id": "general_user_usecases",
                "title": "AI Tools for General Users",
                "subcategories": [
                    {"id": "ai-writing", "title": "Writing Tools"},
                    {"id": "ai-productivity", "title": "Productivity"},
                    {"id": "ai-media-tools", "title": "Image/Video/Audio Tools"},
                ],
            },
            {
                "id": "developer_usecases",
                "title": "AI Tools for Developers",
                "subcategories": [
                    {"id": "ai-coding", "title": "Code Generation"},
                    {"id": "mlops", "title": "MLOps"},
                    {"id": "infra", "title": "Infrastructure"},
                ],
            },
            {
                "id": "sectors",
                "title": "Sector-Specific",
                "subcategories": [
                    {"id": "ai-healthcare", "title": "Healthcare"},
                    {"id": "ai-finance", "title": "Finance"},
                    {"id": "ai-education", "title": "Education"},
                ],
            },
        ]
    }

    asyncio.run(
        classify_category(
            category_data=CATEGORY_DATA,
            news_title="How a designer, an accountant, and a mom learned vibe coding to create apps",
        )
    )
