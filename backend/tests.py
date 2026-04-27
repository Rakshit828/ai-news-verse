from src.core.news_service.sources import (
    OpenAiService,
    GoogleService,
    AnthropicService,
    HackernoonService,
)


# open_ai_service = OpenAiService.create()
# # google_service = GoogleService()
# # anthropic_service = AnthropicService()
# # hackernoon_service = HackernoonService()


# entries = open_ai_service.scrape_rss_feed()
# print(entries)

from pydantic import BaseModel, ConfigDict

class Test(BaseModel):
    name: str
    sid: str 

    model_config = ConfigDict(extra="allow")

test = Test(**{"name": "Rakshit", "sid": "123", "play": "noob"})

print("Extras: ", test.model_extra)
print(test)

lst = []
print(lst[0])